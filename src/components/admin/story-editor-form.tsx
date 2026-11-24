"use client";

import { useActionState } from "react";
import { saveEditedStoryAction } from "@/app/actions/community";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { storyCategories } from "@/data/community";
import type { ActionResult, AlumniStory } from "@/types";

export function StoryEditorForm({ story }: { story: AlumniStory }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveEditedStoryAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={story.id} />
      {state ? (
        <p
          role="alert"
          className={`rounded-md border px-4 py-3 text-sm ${
            state.ok
              ? "border-[#bfe0c9] bg-[#e3efe6] text-[#22553a]"
              : "border-[#e8c3b8] bg-[#fbefeb] text-[#7c3121]"
          }`}
        >
          {state.message}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`title-${story.id}`}>Story Headline *</Label>
          <Input id={`title-${story.id}`} name="title" defaultValue={story.title} required />
        </div>
        <div>
          <Label htmlFor={`cat-${story.id}`}>Category *</Label>
          <Select id={`cat-${story.id}`} name="categorySlug" defaultValue={story.categorySlug}>
            {storyCategories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor={`summary-${story.id}`}>Editorial Summary *</Label>
        <Textarea id={`summary-${story.id}`} name="summary" rows={2} defaultValue={story.summary} required />
      </div>

      <div>
        <Label htmlFor={`content-${story.id}`}>
          Full Story Content (Separate paragraphs with a blank line) *
        </Label>
        <Textarea
          id={`content-${story.id}`}
          name="content"
          rows={6}
          defaultValue={story.content.join("\n\n")}
          required
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor={`status-${story.id}`} className="mb-0">
              Status
            </Label>
            <Select id={`status-${story.id}`} name="status" defaultValue={story.status} className="h-10 w-44">
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={story.featured}
              className="size-4 accent-navy"
            />
            Featured story on magazine header
          </label>
        </div>
        <Button type="submit" variant="navy" disabled={pending}>
          {pending ? "Saving editorial changes…" : "Save & Apply Status"}
        </Button>
      </div>
    </form>
  );
}
