import { Download } from "lucide-react";
import { unsubscribe } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, EmptyRow, Panel, Table } from "@/components/admin/admin-ui";
import { buttonVariants } from "@/components/ui/button";
import { listSubscribers } from "@/lib/data/inbox";
import { cn, formatDate } from "@/lib/utils";

export const metadata = { title: "Newsletter" };

export default async function SubscribersPage() {
  const subs = await listSubscribers();
  return (
    <>
      <AdminHeader
        title="Newsletter subscribers"
        description="Addresses collected from the footer form. Export to your mailing tool."
        actions={
          subs.length ? (
            <a href="/admin/subscribers/export" className={cn(buttonVariants({ variant: "outline" }))}>
              <Download aria-hidden /> Export CSV
            </a>
          ) : null
        }
      />
      <Panel>
        <Table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Subscribed</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id}>
                <td className="font-medium text-ink">{s.email}</td>
                <td className="text-muted-strong">{formatDate(s.createdAt)}</td>
                <td className="text-right">
                  <ActionButton size="sm" variant="ghost" className="text-brick" action={unsubscribe.bind(null, s.id)} confirmMessage={`Remove ${s.email}?`}>
                    Remove
                  </ActionButton>
                </td>
              </tr>
            ))}
            {!subs.length ? <EmptyRow cols={3}>No subscribers yet. Try the newsletter form in the site footer.</EmptyRow> : null}
          </tbody>
        </Table>
      </Panel>
    </>
  );
}
