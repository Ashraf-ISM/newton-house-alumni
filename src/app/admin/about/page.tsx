import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";
import {
  moderateTestimonialAction,
  removeAssociationLeaderAction,
  removeHeritageMilestoneAction,
  removeSuperintendentAction,
  removeTestimonialAction,
  reorderHeritageMilestoneAction,
  reorderSuperintendentAction,
  setCurrentSuperintendentAction,
  toggleHeritageMilestonePublishedAction,
  toggleSuperintendentPublishedAction,
} from "@/app/actions/about";
import {
  AssociationLeaderAdminForm,
  HeritageMilestoneAdminForm,
  SuperintendentAdminForm,
  TestimonialEditAdminForm,
} from "@/components/admin/about-admin-forms";
import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, EmptyRow, Panel, Table } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import {
  listAssociationLeaders,
  listHeritageMilestones,
  listSuperintendents,
  listTestimonials,
} from "@/lib/data/about";
import { cn, formatDate, paramValue } from "@/lib/utils";

export const metadata = { title: "About, Superintendents & Heritage Management" };

const sections = [
  { key: "superintendents", label: "Superintendents" },
  { key: "timeline", label: "Heritage Timeline" },
  { key: "testimonials", label: "Testimonials" },
  { key: "leadership", label: "Association Leadership" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

export default async function AdminAboutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const activeTab = ((paramValue(sp.tab) ?? "superintendents") as SectionKey);
  const editSuptId = paramValue(sp.editSupt);
  const editMilestoneId = paramValue(sp.editMilestone);
  const editTestimonialId = paramValue(sp.editTestimonial);

  const superintendents = listSuperintendents({ includeUnpublished: true });
  const milestones = listHeritageMilestones({ includeUnpublished: true });
  const testimonials = listTestimonials({ includeUnpublished: true });
  const leaders = listAssociationLeaders({ includeUnpublished: true });

  const editingSupt = editSuptId
    ? superintendents.find((s) => s.id === editSuptId) ?? null
    : null;
  const editingMilestone = editMilestoneId
    ? milestones.find((m) => m.id === editMilestoneId) ?? null
    : null;
  const editingTestimonial = editTestimonialId
    ? testimonials.find((t) => t.id === editTestimonialId) ?? null
    : null;

  return (
    <>
      <AdminHeader
        title="About, Superintendents & Heritage Management"
        description="Manage Newton House Superintendents (current & former), Heritage Timeline milestones, alumni testimonials, and confirmed Association Leadership."
        actions={
          <Link
            href="/about"
            className="inline-flex h-9 items-center rounded-full border border-line bg-white px-4 text-xs font-semibold text-ink hover:border-gold-dark"
          >
            Preview About Page →
          </Link>
        }
      />

      {/* Module Tab Navigation */}
      <nav aria-label="About management sections" className="mb-6 flex flex-wrap gap-1.5">
        {sections.map((sec) => {
          const count =
            sec.key === "superintendents"
              ? superintendents.length
              : sec.key === "timeline"
                ? milestones.length
                : sec.key === "testimonials"
                  ? testimonials.length
                  : leaders.length;
          return (
            <Link
              key={sec.key}
              href={`/admin/about?tab=${sec.key}`}
              aria-current={activeTab === sec.key ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                activeTab === sec.key
                  ? "bg-navy text-ivory"
                  : "bg-card text-muted-strong ring-1 ring-line hover:text-ink",
              )}
            >
              {sec.label} <span className="opacity-65">({count})</span>
            </Link>
          );
        })}
      </nav>

      {/* ================================================================
          TAB 1: SUPERINTENDENT MANAGEMENT
          ================================================================ */}
      {activeTab === "superintendents" ? (
        <div className="space-y-8">
          <Panel
            title={
              editingSupt
                ? `Edit Superintendent: ${editingSupt.fullName}`
                : "Add or Appoint a Superintendent"
            }
            actions={
              editingSupt ? (
                <Link
                  href="/admin/about?tab=superintendents"
                  className="text-xs font-semibold text-gold-deep hover:underline"
                >
                  Cancel edit
                </Link>
              ) : null
            }
          >
            <div className="p-6">
              <SuperintendentAdminForm
                record={editingSupt}
                defaultOrder={superintendents.length + 1}
              />
            </div>
          </Panel>

          <Panel title={`Superintendents Roster (${superintendents.length})`}>
            <Table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Superintendent &amp; Designation</th>
                  <th>Period of Service</th>
                  <th>Role Type</th>
                  <th>Visibility</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {superintendents.map((supt) => (
                  <tr key={supt.id}>
                    <td className="whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <span className="w-6 font-mono text-xs font-semibold text-navy">
                          #{supt.displayOrder}
                        </span>
                        <ActionButton
                          size="sm"
                          variant="ghost"
                          action={reorderSuperintendentAction.bind(null, supt.id, "up")}
                          aria-label={`Move ${supt.fullName} up`}
                        >
                          <ArrowUp className="size-3.5" />
                        </ActionButton>
                        <ActionButton
                          size="sm"
                          variant="ghost"
                          action={reorderSuperintendentAction.bind(null, supt.id, "down")}
                          aria-label={`Move ${supt.fullName} down`}
                        >
                          <ArrowDown className="size-3.5" />
                        </ActionButton>
                      </div>
                    </td>
                    <td className="max-w-md">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-ink">{supt.fullName}</span>
                        {supt.isPlaceholder ? <Badge variant="sample">Placeholder</Badge> : null}
                      </div>
                      <p className="text-xs font-medium text-gold-deep">{supt.designation}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-strong">{supt.biography}</p>
                    </td>
                    <td className="whitespace-nowrap text-xs text-muted-strong">
                      {supt.tenurePeriodLabel}
                    </td>
                    <td>
                      {supt.isCurrent ? (
                        <Badge variant="gold">Current Superintendent</Badge>
                      ) : (
                        <Badge variant="neutral">Former Superintendent</Badge>
                      )}
                    </td>
                    <td>
                      <Badge variant={supt.isPublished ? "success" : "warning"}>
                        {supt.isPublished ? "Published" : "Unpublished"}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          href={`/admin/about?tab=superintendents&editSupt=${supt.id}`}
                          className="inline-flex h-8 items-center rounded-full border border-line bg-white px-3 text-xs font-semibold text-ink hover:border-gold-dark"
                        >
                          Edit
                        </Link>
                        {!supt.isCurrent ? (
                          <ActionButton
                            size="sm"
                            variant="navy"
                            action={setCurrentSuperintendentAction.bind(null, supt.id)}
                          >
                            Mark as Current
                          </ActionButton>
                        ) : null}
                        <ActionButton
                          size="sm"
                          variant="outline"
                          action={toggleSuperintendentPublishedAction.bind(
                            null,
                            supt.id,
                            !supt.isPublished,
                          )}
                        >
                          {supt.isPublished ? "Unpublish" : "Publish"}
                        </ActionButton>
                        <ActionButton
                          size="sm"
                          variant="ghost"
                          className="text-brick"
                          action={removeSuperintendentAction.bind(null, supt.id)}
                          confirmMessage={`Delete "${supt.fullName}" permanently?`}
                        >
                          Delete
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
                {!superintendents.length ? (
                  <EmptyRow cols={6}>No superintendent records found.</EmptyRow>
                ) : null}
              </tbody>
            </Table>
          </Panel>
        </div>
      ) : null}

      {/* ================================================================
          TAB 2: HERITAGE TIMELINE MANAGEMENT
          ================================================================ */}
      {activeTab === "timeline" ? (
        <div className="space-y-8">
          <Panel
            title={
              editingMilestone
                ? `Edit Milestone: ${editingMilestone.title}`
                : "Add Heritage Timeline Milestone"
            }
            actions={
              editingMilestone ? (
                <Link
                  href="/admin/about?tab=timeline"
                  className="text-xs font-semibold text-gold-deep hover:underline"
                >
                  Cancel edit
                </Link>
              ) : null
            }
          >
            <div className="p-6">
              <HeritageMilestoneAdminForm
                milestone={editingMilestone}
                defaultOrder={milestones.length + 1}
              />
            </div>
          </Panel>

          <Panel title={`Heritage Timeline Milestones (${milestones.length})`}>
            <Table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Chapter &amp; Title</th>
                  <th>Period / Date Status</th>
                  <th>Visibility</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {milestones.map((m) => (
                  <tr key={m.id}>
                    <td className="whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <span className="w-6 font-mono text-xs font-semibold text-navy">
                          #{m.displayOrder}
                        </span>
                        <ActionButton
                          size="sm"
                          variant="ghost"
                          action={reorderHeritageMilestoneAction.bind(null, m.id, "up")}
                          aria-label={`Move ${m.title} up`}
                        >
                          <ArrowUp className="size-3.5" />
                        </ActionButton>
                        <ActionButton
                          size="sm"
                          variant="ghost"
                          action={reorderHeritageMilestoneAction.bind(null, m.id, "down")}
                          aria-label={`Move ${m.title} down`}
                        >
                          <ArrowDown className="size-3.5" />
                        </ActionButton>
                      </div>
                    </td>
                    <td className="max-w-lg">
                      <p className="font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                        {m.category}
                      </p>
                      <p className="font-semibold text-ink">{m.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-strong">{m.description}</p>
                    </td>
                    <td className="whitespace-nowrap text-xs">
                      {m.periodLabel && m.verified ? (
                        <Badge variant="success">Verified: {m.periodLabel}</Badge>
                      ) : (
                        <Badge variant="warning">
                          {m.periodLabel ? `${m.periodLabel} (Unverified)` : "Archive Verification Pending"}
                        </Badge>
                      )}
                    </td>
                    <td>
                      <Badge variant={m.isPublished ? "success" : "neutral"}>
                        {m.isPublished ? "Published" : "Unpublished"}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          href={`/admin/about?tab=timeline&editMilestone=${m.id}`}
                          className="inline-flex h-8 items-center rounded-full border border-line bg-white px-3 text-xs font-semibold text-ink hover:border-gold-dark"
                        >
                          Edit
                        </Link>
                        <ActionButton
                          size="sm"
                          variant="outline"
                          action={toggleHeritageMilestonePublishedAction.bind(
                            null,
                            m.id,
                            !m.isPublished,
                          )}
                        >
                          {m.isPublished ? "Unpublish" : "Publish"}
                        </ActionButton>
                        <ActionButton
                          size="sm"
                          variant="ghost"
                          className="text-brick"
                          action={removeHeritageMilestoneAction.bind(null, m.id)}
                          confirmMessage={`Delete milestone "${m.title}"?`}
                        >
                          Delete
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
                {!milestones.length ? (
                  <EmptyRow cols={5}>No heritage timeline milestones configured.</EmptyRow>
                ) : null}
              </tbody>
            </Table>
          </Panel>
        </div>
      ) : null}

      {/* ================================================================
          TAB 3: TESTIMONIALS MANAGEMENT
          ================================================================ */}
      {activeTab === "testimonials" ? (
        <div className="space-y-8">
          {editingTestimonial ? (
            <Panel
              title={`Edit Testimonial: ${editingTestimonial.alumniName}`}
              actions={
                <Link
                  href="/admin/about?tab=testimonials"
                  className="text-xs font-semibold text-gold-deep hover:underline"
                >
                  Close editor
                </Link>
              }
            >
              <div className="p-6">
                <TestimonialEditAdminForm testimonial={editingTestimonial} />
              </div>
            </Panel>
          ) : null}

          <Panel title={`Voices of Newton House — Testimonials (${testimonials.length})`}>
            <Table>
              <thead>
                <tr>
                  <th>Alumnus &amp; Batch</th>
                  <th>Quotation</th>
                  <th>Audit Metadata</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map((t) => (
                  <tr key={t.id}>
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink">{t.alumniName}</span>
                        {t.isSample ? <Badge variant="sample">Sample</Badge> : null}
                      </div>
                      <p className="text-xs text-muted-strong">
                        {t.batchYear}
                        {t.department ? ` · ${t.department}` : ""}
                      </p>
                      {t.designation ? (
                        <p className="text-xs text-gold-deep">{t.designation}</p>
                      ) : null}
                    </td>
                    <td className="max-w-md text-xs italic text-ink">“{t.quote}”</td>
                    <td className="text-xs text-muted-strong">
                      <div>Submitted by: {t.submittedBy}</div>
                      <div>Submitted: {formatDate(t.submittedAt)}</div>
                      {t.reviewedBy ? (
                        <div className="text-ink/80">
                          Reviewed by {t.reviewedBy} ({t.reviewedAt ? formatDate(t.reviewedAt) : "—"})
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={
                            t.status === "approved"
                              ? "success"
                              : t.status === "pending"
                                ? "warning"
                                : "danger"
                          }
                        >
                          {t.status}
                        </Badge>
                        <span className="text-[0.65rem] text-muted-strong">
                          {t.isPublished ? "Published" : "Hidden"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          href={`/admin/about?tab=testimonials&editTestimonial=${t.id}`}
                          className="inline-flex h-8 items-center rounded-full border border-line bg-white px-3 text-xs font-semibold text-ink hover:border-gold-dark"
                        >
                          Edit
                        </Link>
                        {t.status !== "approved" || !t.isPublished ? (
                          <ActionButton
                            size="sm"
                            variant="navy"
                            action={moderateTestimonialAction.bind(null, t.id, "approved", true)}
                          >
                            Approve &amp; Publish
                          </ActionButton>
                        ) : (
                          <ActionButton
                            size="sm"
                            variant="outline"
                            action={moderateTestimonialAction.bind(null, t.id, "approved", false)}
                          >
                            Unpublish
                          </ActionButton>
                        )}
                        {t.status !== "rejected" ? (
                          <ActionButton
                            size="sm"
                            variant="outline"
                            action={moderateTestimonialAction.bind(null, t.id, "rejected", false)}
                          >
                            Reject
                          </ActionButton>
                        ) : null}
                        <ActionButton
                          size="sm"
                          variant="ghost"
                          className="text-brick"
                          action={removeTestimonialAction.bind(null, t.id)}
                          confirmMessage={`Delete testimonial by ${t.alumniName}?`}
                        >
                          Delete
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
                {!testimonials.length ? (
                  <EmptyRow cols={5}>No testimonials submitted yet.</EmptyRow>
                ) : null}
              </tbody>
            </Table>
          </Panel>
        </div>
      ) : null}

      {/* ================================================================
          TAB 4: ASSOCIATION LEADERSHIP MANAGEMENT
          ================================================================ */}
      {activeTab === "leadership" ? (
        <div className="space-y-8">
          <Panel title="Confirm & Add Association Office-Bearer">
            <div className="p-6">
              <AssociationLeaderAdminForm />
            </div>
          </Panel>

          <Panel title={`Confirmed Association Leadership (${leaders.length})`}>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Constitutional Role</th>
                  <th>Batch &amp; Department</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((l) => (
                  <tr key={l.id}>
                    <td className="font-semibold text-ink">{l.fullName}</td>
                    <td className="text-gold-deep font-medium">{l.role}</td>
                    <td className="text-xs text-muted-strong">
                      {l.department ?? "—"} {l.batchYear ? `· Class of ${l.batchYear}` : ""}
                    </td>
                    <td>
                      <Badge variant={l.isConfirmed && l.isPublished ? "success" : "warning"}>
                        {l.isConfirmed && l.isPublished ? "Confirmed & Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <ActionButton
                        size="sm"
                        variant="ghost"
                        className="text-brick"
                        action={removeAssociationLeaderAction.bind(null, l.id)}
                        confirmMessage={`Remove ${l.fullName} from Association Leadership?`}
                      >
                        Remove
                      </ActionButton>
                    </td>
                  </tr>
                ))}
                {!leaders.length ? (
                  <EmptyRow cols={5}>
                    No office-bearers confirmed yet. The public About page displays transparent awaiting-confirmation
                    cards until office-bearers are added above.
                  </EmptyRow>
                ) : null}
              </tbody>
            </Table>
          </Panel>
        </div>
      ) : null}
    </>
  );
}
