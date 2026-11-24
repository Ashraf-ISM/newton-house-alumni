import { updateUserRoleAction } from "@/app/actions/community";
import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, EmptyRow, Panel, Table } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { listAuditLogs } from "@/lib/data/community";
import { store } from "@/lib/data/store";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "User Roles & Audit Trail" };

export default function AdminRolesPage() {
  const s = store();
  const users = s.users;
  const auditLogs = listAuditLogs();

  return (
    <>
      <AdminHeader
        title="User Roles & Audit Trail"
        description="Manage role-based access control (Administrator, Editor, Verified Member) and inspect the platform's moderation audit history."
      />

      <Panel title={`Registered User Accounts (${users.length})`} className="mb-8">
        <Table>
          <thead>
            <tr>
              <th>Account Email</th>
              <th>Linked Alumni Profile</th>
              <th>Assigned Role</th>
              <th className="text-right">Role Permissions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const alum = u.alumniId ? s.alumni.find((a) => a.id === u.alumniId) : null;
              return (
                <tr key={u.id}>
                  <td className="font-semibold text-ink">{u.email}</td>
                  <td className="text-xs text-muted-strong">
                    {alum ? (
                      <>
                        <span className="font-medium text-ink">{alum.fullName}</span> ({alum.department},{" "}
                        {alum.graduationYear})
                      </>
                    ) : (
                      "System / Administrative Account"
                    )}
                  </td>
                  <td>
                    <Badge variant={u.role === "admin" ? "gold" : u.role === "editor" ? "success" : "neutral"}>
                      {u.role ?? "member"}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex flex-wrap justify-end gap-2">
                      {u.role !== "admin" ? (
                        <ActionButton
                          size="sm"
                          variant="navy"
                          action={updateUserRoleAction.bind(null, u.id, "admin")}
                        >
                          Grant Admin
                        </ActionButton>
                      ) : null}
                      {u.role !== "editor" ? (
                        <ActionButton
                          size="sm"
                          variant="outline"
                          action={updateUserRoleAction.bind(null, u.id, "editor")}
                        >
                          Grant Editor
                        </ActionButton>
                      ) : null}
                      {u.role !== null ? (
                        <ActionButton
                          size="sm"
                          variant="ghost"
                          action={updateUserRoleAction.bind(null, u.id, null)}
                        >
                          Set as Member
                        </ActionButton>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!users.length ? <EmptyRow cols={4}>No user accounts found.</EmptyRow> : null}
          </tbody>
        </Table>
      </Panel>

      <Panel title={`Moderation & Audit Log (${auditLogs.length})`}>
        <Table>
          <thead>
            <tr>
              <th>Action</th>
              <th>Entity Type</th>
              <th>Target Record</th>
              <th>Status Transition</th>
              <th>Reviewed By</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => (
              <tr key={log.id}>
                <td className="font-semibold text-ink">{log.action}</td>
                <td className="text-xs uppercase tracking-wider text-muted-strong">
                  {log.entityType.replace("_", " ")}
                </td>
                <td className="text-xs text-ink">{log.entityTitle}</td>
                <td className="text-xs text-muted-strong">
                  {log.previousStatus ? `${log.previousStatus} → ` : ""}
                  <span className="font-semibold text-navy">{log.newStatus ?? "—"}</span>
                </td>
                <td className="text-xs font-medium text-ink">{log.actorEmail}</td>
                <td className="whitespace-nowrap text-xs text-muted-strong">
                  {formatDate(log.createdAt)}
                </td>
              </tr>
            ))}
            {!auditLogs.length ? <EmptyRow cols={6}>No moderation actions recorded yet.</EmptyRow> : null}
          </tbody>
        </Table>
      </Panel>
    </>
  );
}
