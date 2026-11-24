import {
  moderateMentorProfileAction,
  respondToMentorshipRequestAction,
} from "@/app/actions/community";
import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, EmptyRow, Panel, Table } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import {
  listMentors,
  listMentorshipRequests,
  mentorCategories,
} from "@/lib/data/community";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Mentorship Management" };

export default async function AdminMentorshipPage() {
  const mentors = listMentors({ includeUnapproved: true });
  const requests = listMentorshipRequests({ includeAllForAdmin: true });

  return (
    <>
      <AdminHeader
        title="Mentorship Management"
        description="Approve Newton House mentor profiles and monitor structured mentorship requests across the community."
      />

      <Panel title={`Mentor Directory Profiles (${mentors.length})`} className="mb-8">
        <Table>
          <thead>
            <tr>
              <th>Mentor</th>
              <th>Expertise & Categories</th>
              <th>Availability</th>
              <th>Audit Trail</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mentors.map((m) => (
              <tr key={m.id}>
                <td className="max-w-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink">{m.name}</span>
                    {m.isSample ? <Badge variant="sample">Sample</Badge> : null}
                  </div>
                  <p className="text-xs text-muted-strong">
                    {m.designation}, {m.organisation} · {m.department}, {m.graduationYear}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-strong">{m.bio}</p>
                </td>
                <td className="max-w-xs text-xs text-muted-strong">
                  <div className="font-medium text-ink">{m.expertise.join(", ")}</div>
                  <div className="mt-1">
                    {m.categories
                      .map((slug) => mentorCategories.find((c) => c.slug === slug)?.name ?? slug)
                      .join(" · ")}
                  </div>
                </td>
                <td className="whitespace-nowrap text-xs text-muted-strong">
                  <div className="font-medium text-ink">{m.availability}</div>
                  <div>{m.preferredCommunication}</div>
                </td>
                <td className="text-xs text-muted-strong">
                  <div>Submitted by: {m.submittedBy}</div>
                  <div>Submitted: {formatDate(m.submittedAt)}</div>
                  {m.reviewedBy ? (
                    <div className="text-ink/80">
                      Reviewed by {m.reviewedBy} ({m.reviewedAt ? formatDate(m.reviewedAt) : "—"})
                    </div>
                  ) : null}
                </td>
                <td>
                  <Badge
                    variant={
                      m.status === "approved"
                        ? "success"
                        : m.status === "pending"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {m.status}
                  </Badge>
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    {m.status !== "approved" ? (
                      <ActionButton
                        size="sm"
                        variant="navy"
                        action={moderateMentorProfileAction.bind(null, m.id, "approved")}
                      >
                        Approve
                      </ActionButton>
                    ) : null}
                    {m.status !== "rejected" ? (
                      <ActionButton
                        size="sm"
                        variant="outline"
                        action={moderateMentorProfileAction.bind(null, m.id, "rejected")}
                      >
                        Reject
                      </ActionButton>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {!mentors.length ? <EmptyRow cols={6}>No mentor profiles registered.</EmptyRow> : null}
          </tbody>
        </Table>
      </Panel>

      <Panel title={`Mentorship Requests (${requests.length})`}>
        <Table>
          <thead>
            <tr>
              <th>Request & Question</th>
              <th>Mentee</th>
              <th>Mentor</th>
              <th>Channel</th>
              <th>Status</th>
              <th className="text-right">Moderation</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td className="max-w-md">
                  <p className="font-semibold text-ink">{r.title}</p>
                  <p className="text-xs font-medium text-gold-deep">{r.areaOfGuidance}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-strong">{r.question}</p>
                </td>
                <td className="text-xs text-muted-strong">
                  <div className="font-medium text-ink">{r.menteeName}</div>
                  <div>{r.menteeBatch}</div>
                  <div>{r.menteeEmail}</div>
                </td>
                <td className="whitespace-nowrap text-xs font-medium text-ink">{r.mentorName}</td>
                <td className="whitespace-nowrap text-xs text-muted-strong">{r.preferredCommunication}</td>
                <td>
                  <Badge
                    variant={
                      r.status === "accepted"
                        ? "success"
                        : r.status === "pending" || r.status === "info_requested"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {r.status.replace("_", " ")}
                  </Badge>
                </td>
                <td>
                  <div className="flex flex-wrap justify-end gap-2">
                    {r.status !== "accepted" ? (
                      <ActionButton
                        size="sm"
                        variant="navy"
                        action={respondToMentorshipRequestAction.bind(
                          null,
                          r.id,
                          "accepted",
                          "Approved via Mentorship Coordinator.",
                        )}
                      >
                        Accept
                      </ActionButton>
                    ) : null}
                    {r.status !== "info_requested" ? (
                      <ActionButton
                        size="sm"
                        variant="outline"
                        action={respondToMentorshipRequestAction.bind(
                          null,
                          r.id,
                          "info_requested",
                          "Please provide additional background on your mentorship goals.",
                        )}
                      >
                        Request Info
                      </ActionButton>
                    ) : null}
                    {r.status !== "declined" ? (
                      <ActionButton
                        size="sm"
                        variant="outline"
                        action={respondToMentorshipRequestAction.bind(null, r.id, "declined", null)}
                      >
                        Decline
                      </ActionButton>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {!requests.length ? <EmptyRow cols={6}>No mentorship requests submitted yet.</EmptyRow> : null}
          </tbody>
        </Table>
      </Panel>
    </>
  );
}
