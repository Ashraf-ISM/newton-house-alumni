import { markMessage } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, Panel } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { listContactMessages } from "@/lib/data/inbox";
import { formatDate, formatTime } from "@/lib/utils";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const messages = await listContactMessages();
  return (
    <>
      <AdminHeader title="Messages" description="Submissions from the contact form, including photograph and memory submissions and nominations." />
      <Panel>
        <ul className="divide-y divide-line">
          {messages.map((m) => (
            <li key={m.id} className="flex flex-col gap-4 px-6 py-5 lg:flex-row">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-ink">{m.subject}</p>
                  <Badge variant={m.handled ? "neutral" : "warning"}>{m.handled ? "Handled" : "Open"}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-strong">
                  {m.name} ·{" "}
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`} className="text-gold-deep hover:underline">
                    {m.email}
                  </a>{" "}
                  · {formatDate(m.createdAt)} {formatTime(m.createdAt)}
                </p>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/90">{m.message}</p>
              </div>
              <div>
                <ActionButton size="sm" variant={m.handled ? "outline" : "navy"} action={markMessage.bind(null, m.id, !m.handled)}>
                  {m.handled ? "Reopen" : "Mark handled"}
                </ActionButton>
              </div>
            </li>
          ))}
          {!messages.length ? <li className="px-6 py-14 text-center text-sm text-muted-strong">No messages yet.</li> : null}
        </ul>
      </Panel>
    </>
  );
}
