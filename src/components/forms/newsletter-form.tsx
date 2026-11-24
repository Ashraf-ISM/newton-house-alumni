"use client";

import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useActionState } from "react";
import { subscribeNewsletter } from "@/app/actions/public";
import { cn } from "@/lib/utils";

export function NewsletterForm({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  const [state, action, pending] = useActionState(subscribeNewsletter, null);
  const dark = tone === "dark";
  return (
    <form action={action} className={className} noValidate>
      <label htmlFor={`nl-email-${tone}`} className="sr-only">
        Email address
      </label>
      <div
        className={cn(
          "flex items-center gap-1 rounded-full border p-1 pl-5 transition-colors focus-within:border-gold",
          dark ? "border-gold/25 bg-white/[0.04]" : "border-line bg-white",
        )}
      >
        <input
          id={`nl-email-${tone}`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your email"
          className={cn(
            "h-10 min-w-0 flex-1 bg-transparent text-sm outline-none",
            dark ? "text-ivory placeholder:text-ivory/45" : "text-ink placeholder:text-muted",
          )}
        />
        {/* Honeypot */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <button
          type="submit"
          disabled={pending}
          aria-label="Subscribe"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-gold text-navy transition-colors hover:bg-[#e2bd7e] disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : state?.ok ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
        </button>
      </div>
      <p
        aria-live="polite"
        className={cn(
          "mt-2.5 min-h-5 text-xs",
          state ? (state.ok ? (dark ? "text-gold" : "text-[#22553a]") : dark ? "text-[#f0a48f]" : "text-brick") : "",
        )}
      >
        {state?.message}
      </p>
    </form>
  );
}
