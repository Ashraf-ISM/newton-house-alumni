import Link from "next/link";
import { removeAlumni, setAlumniStatus } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, EmptyRow, Panel, Table } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { adminListAlumni } from "@/lib/data/alumni";
import { cn, formatDate, paramValue } from "@/lib/utils";
import type { AlumniStatus } from "@/types";

export const metadata = { title: "Alumni" };

const tabs: { key: AlumniStatus | "all"; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];
const badge = { pending: "warning", approved: "success", rejected: "danger" } as const;

export default async function AdminAlumniPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const status = (paramValue(sp.status) ?? "pending") as AlumniStatus | "all";
  const q = (paramValue(sp.q) ?? "").toLowerCase();
  const all = await adminListAlumni();
  const list = all
    .filter((a) => status === "all" || a.status === status)
    .filter((a) => !q || `${a.fullName} ${a.email} ${a.graduationYear} ${a.department}`.toLowerCase().includes(q));
  const count = (k: string) => (k === "all" ? all.length : all.filter((a) => a.status === k).length);

  return (
    <>
      <AdminHeader title="Alumni" description="Review registrations, approve or reject members and edit profiles. Private contact details are visible only here." />
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filter by status" className="flex flex-wrap gap-1">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/admin/alumni?status=${t.key}`}
              aria-current={status === t.key ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                status === t.key ? "bg-navy text-ivory" : "text-muted-strong hover:bg-ink/5",
              )}
            >
              {t.label} <span className="opacity-60">{count(t.key)}</span>
            </Link>
          ))}
        </nav>
        <form className="flex gap-2" role="search">
          <input type="hidden" name="status" value={status} />
          <label htmlFor="admin-q" className="sr-only">Search</label>
          <input id="admin-q" name="q" defaultValue={q} placeholder="Search name, email, batch" className="h-10 w-64 rounded-full border border-line bg-white px-4 text-sm focus:border-gold-dark focus:outline-none" />
        </form>
      </div>
      <Panel>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Batch</th>
              <th>Email (private)</th>
              <th>Visibility</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id}>
                <td>
                  <Link href={`/admin/alumni/${a.id}`} className="font-semibold text-ink hover:text-gold-deep">
                    {a.fullName}
                  </Link>
                  {a.isSample ? <Badge variant="sample" className="ml-2">Sample</Badge> : null}
                  <p className="text-xs text-muted-strong">Registered {formatDate(a.createdAt)}</p>
                </td>
                <td className="whitespace-nowrap text-muted-strong">
                  {a.department}, {a.graduationYear}
                </td>
                <td className="text-muted-strong">{a.email}</td>
                <td className="capitalize text-muted-strong">{a.visibility}</td>
                <td>
                  <Badge variant={badge[a.status]}>{a.status}</Badge>
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    {a.status !== "approved" ? (
                      <ActionButton size="sm" variant="navy" action={setAlumniStatus.bind(null, a.id, "approved")}>
                        Approve
                      </ActionButton>
                    ) : null}
                    {a.status !== "rejected" ? (
                      <ActionButton size="sm" variant="outline" action={setAlumniStatus.bind(null, a.id, "rejected")} confirmMessage={`Reject ${a.fullName}?`}>
                        Reject
                      </ActionButton>
                    ) : null}
                    <ActionButton size="sm" variant="ghost" className="text-brick" action={removeAlumni.bind(null, a.id)} confirmMessage={`Permanently delete ${a.fullName}'s record? This cannot be undone.`}>
                      Delete
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}
            {!list.length ? <EmptyRow cols={6}>No records in this view.</EmptyRow> : null}
          </tbody>
        </Table>
      </Panel>
    </>
  );
}
