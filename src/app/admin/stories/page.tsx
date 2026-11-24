import Link from "next/link";
import {
  moderateAlumniStoryAction,
  removeAlumniStoryAction,
} from "@/app/actions/community";
import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, EmptyRow, Panel, Table } from "@/components/admin/admin-ui";
import { StoryEditorForm } from "@/components/admin/story-editor-form";
import { Badge } from "@/components/ui/badge";
import { getStoryById, listStories, storyCategories } from "@/lib/data/community";
import { cn, formatDate, paramValue } from "@/lib/utils";
import type { StoryStatus } from "@/types";

export const metadata = { title: "Story Management" };

const tabs: { key: StoryStatus | "all"; label: string }[] = [
  { key: "all", label: "All Stories" },
  { key: "draft", label: "Draft" },
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "Under Review" },
  { key: "approved", label: "Approved" },
  { key: "published", label: "Published" },
  { key: "rejected", label: "Rejected" },
];

const badgeMap: Record<StoryStatus, "neutral" | "warning" | "success" | "danger"> = {
  draft: "neutral",
  submitted: "warning",
  under_review: "warning",
  approved: "success",
  published: "success",
  rejected: "danger",
};

export default async function AdminStoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const status = (paramValue(sp.status) ?? "all") as StoryStatus | "all";
  const editId = paramValue(sp.edit);
  const all = listStories({ includeUnpublished: true });
  const list = all.filter((s) => status === "all" || s.status === status);
  const editing = editId ? getStoryById(editId) : null;
  const count = (k: StoryStatus | "all") =>
    k === "all" ? all.length : all.filter((s) => s.status === k).length;

  return (
    <>
      <AdminHeader
        title="Story Management"
        description="Editorial moderation queue for Voices of Newton House. Review, edit, approve, and publish alumni stories."
      />

      {editing ? (
        <Panel
          title={`Editorial Review: ${editing.title}`}
          className="mb-8"
          actions={
            <Link href="/admin/stories" className="text-xs font-semibold text-gold-deep hover:underline">
              Close editor
            </Link>
          }
        >
          <div className="p-6">
            <StoryEditorForm story={editing} />
          </div>
        </Panel>
      ) : null}

      <nav aria-label="Filter stories by status" className="mb-5 flex flex-wrap gap-1">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/stories?status=${t.key}`}
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

      <Panel>
        <Table>
          <thead>
            <tr>
              <th>Story & Author</th>
              <th>Category</th>
              <th>Audit Metadata</th>
              <th>Status</th>
              <th className="text-right">Editorial Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((st) => {
              const cat = storyCategories.find((c) => c.slug === st.categorySlug);
              return (
                <tr key={st.id}>
                  <td className="max-w-md">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/alumni/stories/${st.slug}`}
                        className="font-semibold text-ink hover:text-gold-deep"
                      >
                        {st.title}
                      </Link>
                      {st.featured ? <Badge variant="gold">Featured</Badge> : null}
                      {st.isSample ? <Badge variant="sample">Sample</Badge> : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-strong">
                      By <span className="font-medium text-ink">{st.authorName}</span> ({st.authorDepartment},{" "}
                      {st.authorGraduationYear})
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-strong">{st.summary}</p>
                  </td>
                  <td className="whitespace-nowrap text-xs font-medium text-muted-strong">
                    {cat?.name ?? st.categorySlug}
                  </td>
                  <td className="text-xs text-muted-strong">
                    <div>Submitted by: {st.submittedBy}</div>
                    <div>Submitted: {formatDate(st.submittedAt)}</div>
                    {st.reviewedBy ? (
                      <div className="text-ink/80">
                        Reviewed by {st.reviewedBy} ({st.reviewedAt ? formatDate(st.reviewedAt) : "—"})
                      </div>
                    ) : null}
                  </td>
                  <td>
                    <Badge variant={badgeMap[st.status]}>{st.status.replace("_", " ")}</Badge>
                  </td>
                  <td>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        href={`/admin/stories?status=${status}&edit=${st.id}`}
                        className="inline-flex h-8 items-center rounded-full border border-line bg-white px-3 text-xs font-semibold text-ink hover:border-gold-dark"
                      >
                        Edit Story
                      </Link>
                      {st.status !== "under_review" && st.status !== "published" ? (
                        <ActionButton
                          size="sm"
                          variant="outline"
                          action={moderateAlumniStoryAction.bind(null, st.id, "under_review")}
                        >
                          Under Review
                        </ActionButton>
                      ) : null}
                      {st.status !== "approved" && st.status !== "published" ? (
                        <ActionButton
                          size="sm"
                          variant="outline"
                          action={moderateAlumniStoryAction.bind(null, st.id, "approved")}
                        >
                          Approve
                        </ActionButton>
                      ) : null}
                      {st.status !== "published" ? (
                        <ActionButton
                          size="sm"
                          variant="navy"
                          action={moderateAlumniStoryAction.bind(null, st.id, "published")}
                        >
                          Publish
                        </ActionButton>
                      ) : null}
                      {st.status !== "rejected" ? (
                        <ActionButton
                          size="sm"
                          variant="outline"
                          action={moderateAlumniStoryAction.bind(null, st.id, "rejected")}
                        >
                          Reject
                        </ActionButton>
                      ) : null}
                      <ActionButton
                        size="sm"
                        variant="ghost"
                        className="text-brick"
                        action={removeAlumniStoryAction.bind(null, st.id)}
                        confirmMessage={`Delete "${st.title}" permanently?`}
                      >
                        Delete
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!list.length ? <EmptyRow cols={5}>No stories in this status view.</EmptyRow> : null}
          </tbody>
        </Table>
      </Panel>
    </>
  );
}
