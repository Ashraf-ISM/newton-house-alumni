"use client";

import { useActionState } from "react";
import {
  saveAssociationLeaderAction,
  saveEditedTestimonialAction,
  saveHeritageMilestoneAction,
  saveSuperintendentAction,
} from "@/app/actions/about";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import {
  associationLeadershipRoles,
  heritageTimelineCategories,
} from "@/data/about";
import { departments } from "@/data/alumni";
import type {
  ActionResult,
  AlumniTestimonial,
  HeritageMilestone,
  SuperintendentRecord,
} from "@/types";

function StatusBanner({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  return (
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
  );
}

/* ==================================================================
   1. SUPERINTENDENT FORM (ADD / EDIT)
   ================================================================== */
export function SuperintendentAdminForm({
  record,
  defaultOrder = 10,
}: {
  record?: SuperintendentRecord | null;
  defaultOrder?: number;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveSuperintendentAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      {record ? <input type="hidden" name="id" value={record.id} /> : null}
      {record?.profileImage ? (
        <input type="hidden" name="existingImage" value={record.profileImage} />
      ) : null}

      <StatusBanner state={state} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`supt-name-${record?.id ?? "new"}`}>Full Name *</Label>
          <Input
            id={`supt-name-${record?.id ?? "new"}`}
            name="fullName"
            defaultValue={record?.fullName ?? ""}
            placeholder="e.g. Prof. [Verified Full Name]"
            required
          />
        </div>
        <div>
          <Label htmlFor={`supt-desig-${record?.id ?? "new"}`}>Designation *</Label>
          <Input
            id={`supt-desig-${record?.id ?? "new"}`}
            name="designation"
            defaultValue={record?.designation ?? "Former Superintendent, Newton House"}
            placeholder="Current or Former Superintendent, Newton House"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <Label htmlFor={`supt-start-${record?.id ?? "new"}`}>Tenure Start Year</Label>
          <Input
            id={`supt-start-${record?.id ?? "new"}`}
            name="tenureStart"
            defaultValue={record?.tenureStart ?? ""}
            placeholder="e.g. 2018"
          />
        </div>
        <div>
          <Label htmlFor={`supt-end-${record?.id ?? "new"}`}>Tenure End Year</Label>
          <Input
            id={`supt-end-${record?.id ?? "new"}`}
            name="tenureEnd"
            defaultValue={record?.tenureEnd ?? ""}
            placeholder="e.g. 2023 or Present"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`supt-label-${record?.id ?? "new"}`}>Display Period Label</Label>
          <Input
            id={`supt-label-${record?.id ?? "new"}`}
            name="tenurePeriodLabel"
            defaultValue={record?.tenurePeriodLabel ?? ""}
            placeholder="e.g. 2018 – 2023"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`supt-acad-${record?.id ?? "new"}`}>Academic / Faculty Background</Label>
          <Input
            id={`supt-acad-${record?.id ?? "new"}`}
            name="academicBackground"
            defaultValue={record?.academicBackground ?? ""}
            placeholder="e.g. Department of Physics, Patna Science College"
          />
        </div>
        <div>
          <Label htmlFor={`supt-photo-${record?.id ?? "new"}`}>Portrait Photograph (JPEG, PNG, WebP)</Label>
          <input
            id={`supt-photo-${record?.id ?? "new"}`}
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="block h-12 w-full rounded-md border border-line bg-white px-3 py-2.5 text-xs text-ink"
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`supt-bio-${record?.id ?? "new"}`}>Short Biography *</Label>
        <Textarea
          id={`supt-bio-${record?.id ?? "new"}`}
          name="biography"
          rows={3}
          defaultValue={record?.biography ?? ""}
          placeholder="Verified biographical summary..."
          required
        />
      </div>

      <div>
        <Label htmlFor={`supt-contrib-${record?.id ?? "new"}`}>Contributions to Newton House *</Label>
        <Textarea
          id={`supt-contrib-${record?.id ?? "new"}`}
          name="contributions"
          rows={2}
          defaultValue={record?.contributions ?? ""}
          placeholder="Stewardship, discipline, student mentorship and hostel development..."
          required
        />
      </div>

      <div>
        <Label htmlFor={`supt-msg-${record?.id ?? "new"}`}>Personal Message or Recollection (Optional)</Label>
        <Input
          id={`supt-msg-${record?.id ?? "new"}`}
          name="personalMessage"
          defaultValue={record?.personalMessage ?? ""}
          placeholder="Optional quote or message to residents and alumni"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
        <div className="flex flex-wrap items-center gap-5 text-sm text-ink">
          <div className="flex items-center gap-2">
            <Label htmlFor={`supt-order-${record?.id ?? "new"}`} className="mb-0">
              Order
            </Label>
            <Input
              id={`supt-order-${record?.id ?? "new"}`}
              name="displayOrder"
              type="number"
              defaultValue={record?.displayOrder ?? defaultOrder}
              className="h-9 w-20"
            />
          </div>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="isCurrent"
              defaultChecked={record?.isCurrent ?? false}
              className="size-4 accent-navy"
            />
            <span>Mark as Current Superintendent (moves existing current to former)</span>
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={record?.isPublished ?? true}
              className="size-4 accent-navy"
            />
            <span>Published</span>
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="isPlaceholder"
              defaultChecked={record?.isPlaceholder ?? false}
              className="size-4 accent-navy"
            />
            <span>Placeholder (unverified record)</span>
          </label>
        </div>

        <Button type="submit" variant="navy" disabled={pending}>
          {pending ? "Saving…" : record ? "Update Superintendent" : "Add Superintendent"}
        </Button>
      </div>
    </form>
  );
}

/* ==================================================================
   2. HERITAGE TIMELINE MILESTONE FORM (ADD / EDIT)
   ================================================================== */
export function HeritageMilestoneAdminForm({
  milestone,
  defaultOrder = 10,
}: {
  milestone?: HeritageMilestone | null;
  defaultOrder?: number;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveHeritageMilestoneAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      {milestone ? <input type="hidden" name="id" value={milestone.id} /> : null}
      {milestone?.imageUrl ? (
        <input type="hidden" name="existingImageUrl" value={milestone.imageUrl} />
      ) : null}

      <StatusBanner state={state} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor={`ms-cat-${milestone?.id ?? "new"}`}>Timeline Category *</Label>
          <Select
            id={`ms-cat-${milestone?.id ?? "new"}`}
            name="category"
            defaultValue={milestone?.category ?? "The Early Years"}
          >
            {heritageTimelineCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={`ms-period-${milestone?.id ?? "new"}`}>
            Year or Period (Leave blank if unverified)
          </Label>
          <Input
            id={`ms-period-${milestone?.id ?? "new"}`}
            name="periodLabel"
            defaultValue={milestone?.periodLabel ?? ""}
            placeholder="e.g. Present Era"
          />
        </div>
        <div>
          <Label htmlFor={`ms-photo-${milestone?.id ?? "new"}`}>Historical Photograph</Label>
          <input
            id={`ms-photo-${milestone?.id ?? "new"}`}
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="block h-12 w-full rounded-md border border-line bg-white px-3 py-2.5 text-xs text-ink"
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`ms-title-${milestone?.id ?? "new"}`}>Milestone Title *</Label>
        <Input
          id={`ms-title-${milestone?.id ?? "new"}`}
          name="title"
          defaultValue={milestone?.title ?? ""}
          placeholder="Headline for this historical chapter"
          required
        />
      </div>

      <div>
        <Label htmlFor={`ms-desc-${milestone?.id ?? "new"}`}>Historical Description *</Label>
        <Textarea
          id={`ms-desc-${milestone?.id ?? "new"}`}
          name="description"
          rows={3}
          defaultValue={milestone?.description ?? ""}
          placeholder="Narrative description of this era at Newton House..."
          required
        />
      </div>

      <div>
        <Label htmlFor={`ms-dev-${milestone?.id ?? "new"}`}>Important Event or Institutional Development</Label>
        <Input
          id={`ms-dev-${milestone?.id ?? "new"}`}
          name="importantDevelopment"
          defaultValue={milestone?.importantDevelopment ?? ""}
          placeholder="Key development highlighted in the callout box"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
        <div className="flex flex-wrap items-center gap-5 text-sm text-ink">
          <div className="flex items-center gap-2">
            <Label htmlFor={`ms-order-${milestone?.id ?? "new"}`} className="mb-0">
              Order
            </Label>
            <Input
              id={`ms-order-${milestone?.id ?? "new"}`}
              name="displayOrder"
              type="number"
              defaultValue={milestone?.displayOrder ?? defaultOrder}
              className="h-9 w-20"
            />
          </div>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="verified"
              defaultChecked={milestone?.verified ?? false}
              className="size-4 accent-navy"
            />
            <span>Date/Period Verified from Official Archive</span>
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={milestone?.isPublished ?? true}
              className="size-4 accent-navy"
            />
            <span>Published</span>
          </label>
        </div>

        <Button type="submit" variant="navy" disabled={pending}>
          {pending ? "Saving…" : milestone ? "Update Milestone" : "Add Milestone"}
        </Button>
      </div>
    </form>
  );
}

/* ==================================================================
   3. TESTIMONIAL EDIT FORM
   ================================================================== */
export function TestimonialEditAdminForm({
  testimonial,
}: {
  testimonial: AlumniTestimonial;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveEditedTestimonialAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={testimonial.id} />
      <StatusBanner state={state} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor={`test-name-${testimonial.id}`}>Alumni Name *</Label>
          <Input
            id={`test-name-${testimonial.id}`}
            name="alumniName"
            defaultValue={testimonial.alumniName}
            required
          />
        </div>
        <div>
          <Label htmlFor={`test-batch-${testimonial.id}`}>Batch / Year *</Label>
          <Input
            id={`test-batch-${testimonial.id}`}
            name="batchYear"
            defaultValue={testimonial.batchYear}
            required
          />
        </div>
        <div>
          <Label htmlFor={`test-desig-${testimonial.id}`}>Designation</Label>
          <Input
            id={`test-desig-${testimonial.id}`}
            name="designation"
            defaultValue={testimonial.designation ?? ""}
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`test-quote-${testimonial.id}`}>Quotation *</Label>
        <Textarea
          id={`test-quote-${testimonial.id}`}
          name="quote"
          rows={3}
          defaultValue={testimonial.quote}
          required
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-ink">
          <div className="flex items-center gap-2">
            <Label htmlFor={`test-status-${testimonial.id}`} className="mb-0">
              Status
            </Label>
            <Select
              id={`test-status-${testimonial.id}`}
              name="status"
              defaultValue={testimonial.status}
              className="h-9 w-36"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={testimonial.isPublished}
              className="size-4 accent-navy"
            />
            <span>Published on About Page</span>
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="isSample"
              defaultChecked={testimonial.isSample}
              className="size-4 accent-navy"
            />
            <span>Sample Badge</span>
          </label>
        </div>

        <Button type="submit" variant="navy" disabled={pending}>
          {pending ? "Saving…" : "Save Testimonial"}
        </Button>
      </div>
    </form>
  );
}

/* ==================================================================
   4. ASSOCIATION LEADERSHIP FORM (ADD / CONFIRM)
   ================================================================== */
export function AssociationLeaderAdminForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveAssociationLeaderAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <StatusBanner state={state} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="leader-name">Confirmed Full Name *</Label>
          <Input id="leader-name" name="fullName" placeholder="Full name" required />
        </div>
        <div>
          <Label htmlFor="leader-role">Constitutional Role *</Label>
          <Select id="leader-role" name="role" defaultValue="President">
            {associationLeadershipRoles.map((r) => (
              <option key={r.role} value={r.role}>
                {r.role}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="leader-year">Graduation Year</Label>
          <Input id="leader-year" name="batchYear" type="number" placeholder="e.g. 2008" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="leader-dept">Department</Label>
          <Select id="leader-dept" name="department" defaultValue="Physics">
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="leader-desig">Professional Designation</Label>
          <Input id="leader-desig" name="designation" placeholder="e.g. Professor of Physics" />
        </div>
        <div>
          <Label htmlFor="leader-photo">Portrait Photograph</Label>
          <input
            id="leader-photo"
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="block h-12 w-full rounded-md border border-line bg-white px-3 py-2.5 text-xs text-ink"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
        <div className="flex flex-wrap items-center gap-5 text-sm text-ink">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="isConfirmed" defaultChecked className="size-4 accent-navy" />
            <span>Confirmed by Executive Committee</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="isPublished" defaultChecked className="size-4 accent-navy" />
            <span>Published on About Page</span>
          </label>
        </div>
        <Button type="submit" variant="navy" disabled={pending}>
          {pending ? "Saving…" : "Confirm & Add Office-Bearer"}
        </Button>
      </div>
    </form>
  );
}
