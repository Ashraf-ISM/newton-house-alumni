import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { uid } from "@/lib/utils";
import type { ContactMessage, NewsletterSubscriber } from "@/types";
import { store } from "./store";

/* ---------------- Contact messages ---------------- */

export async function createContactMessage(m: { name: string; email: string; subject: string; message: string }) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").insert(m);
    if (error) throw new Error(error.message);
    return;
  }
  store().messages.unshift({ ...m, id: uid(), handled: false, createdAt: new Date().toISOString() });
}

export async function listContactMessages(): Promise<ContactMessage[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("[inbox] messages", error.message);
      return [];
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      subject: r.subject,
      message: r.message,
      handled: r.handled,
      createdAt: r.created_at,
    }));
  }
  return store().messages;
}

export async function setMessageHandled(id: string, handled: boolean) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").update({ handled }).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const m = store().messages.find((x) => x.id === id);
  if (m) m.handled = handled;
}

/* ---------------- Newsletter ---------------- */

/** Returns false when the address was already subscribed. */
export async function subscribe(email: string): Promise<boolean> {
  const normalised = email.trim().toLowerCase();
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: normalised });
    if (error) {
      if (error.code === "23505") return false;
      throw new Error(error.message);
    }
    return true;
  }
  const s = store();
  if (s.subscribers.some((x) => x.email === normalised)) return false;
  s.subscribers.unshift({ id: uid(), email: normalised, createdAt: new Date().toISOString() });
  return true;
}

export async function listSubscribers(): Promise<NewsletterSubscriber[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, created_at")
      .is("unsubscribed_at", null)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[inbox] subscribers", error.message);
      return [];
    }
    return (data ?? []).map((r) => ({ id: r.id, email: r.email, createdAt: r.created_at }));
  }
  return store().subscribers;
}

export async function removeSubscriber(id: string) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const s = store();
  s.subscribers = s.subscribers.filter((x) => x.id !== id);
}
