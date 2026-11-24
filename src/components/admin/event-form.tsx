"use client";

import { useState } from "react";
import { saveEvent } from "@/app/actions/admin";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { SubmitButton } from "@/components/ui/submit-button";
import { eventCategoryLabels } from "@/data/events";
import { useFormAction } from "@/hooks/use-form-action";
import { slugify } from "@/lib/utils";
import type { NHEvent } from "@/types";

/** ISO → value for <input type="datetime-local"> in IST. */
function toLocal(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + 5.5 * 3600_000);
  return d.toISOString().slice(0, 16);
}

export function EventForm({ event }: { event?: NHEvent }) {
  const [state, onSubmit, pending] = useFormAction(saveEvent);
  const fe = state && !state.ok ? state.fieldErrors : undefined;
  const [slug, setSlug] = useState(event?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!event);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {event ? <input type="hidden" name="id" value={event.id} /> : null}
      <Field id="title" label="Title" required error={fe?.title}>
        {(a) => <Input {...a} name="title" defaultValue={event?.title} onChange={(e) => !slugTouched && setSlug(slugify(e.target.value))} />}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="slug" label="URL slug" required error={fe?.slug} hint={`/events/${slug || "…"}`}>
          {(a) => (
            <Input
              {...a}
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
            />
          )}
        </Field>
        <Field id="category" label="Category" required error={fe?.category}>
          {(a) => (
            <Select {...a} name="category" defaultValue={event?.category ?? "reunion"}>
              {Object.entries(eventCategoryLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field id="startsAt" label="Starts (IST)" required error={fe?.startsAt}>
          {(a) => <Input {...a} name="startsAt" type="datetime-local" defaultValue={toLocal(event?.startsAt)} />}
        </Field>
        <Field id="endsAt" label="Ends (IST)" error={fe?.endsAt}>
          {(a) => <Input {...a} name="endsAt" type="datetime-local" defaultValue={toLocal(event?.endsAt)} />}
        </Field>
        <Field id="venue" label="Venue" required error={fe?.venue}>
          {(a) => <Input {...a} name="venue" defaultValue={event?.venue} />}
        </Field>
        <Field id="city" label="City" required error={fe?.city}>
          {(a) => <Input {...a} name="city" defaultValue={event?.city ?? "Patna"} />}
        </Field>
      </div>
      <Field id="summary" label="Summary" required error={fe?.summary} hint="One or two sentences shown on cards.">
        {(a) => <Textarea {...a} name="summary" rows={2} className="min-h-20" defaultValue={event?.summary} />}
      </Field>
      <Field id="body" label="Full description" error={fe?.body} hint="Separate paragraphs with a blank line.">
        {(a) => <Textarea {...a} name="body" rows={8} defaultValue={event?.body.join("\n\n")} />}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="image" label="Cover image upload" error={fe?.image} hint="Replaces the current image.">
          {(a) => <Input {...a} name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="pt-3" />}
        </Field>
        <Field id="imageUrl" label="…or image path / URL" error={fe?.imageUrl} hint="e.g. /images/events/reunion.webp">
          {(a) => <Input {...a} name="imageUrl" defaultValue={event?.imageUrl?.startsWith("data:") ? "" : (event?.imageUrl ?? "")} />}
        </Field>
        <Field id="capacity" label="Capacity" error={fe?.capacity}>
          {(a) => <Input {...a} name="capacity" inputMode="numeric" defaultValue={event?.capacity ?? ""} />}
        </Field>
      </div>
      {event?.imageUrl?.startsWith("data:") ? <input type="hidden" name="imageUrl" value={event.imageUrl} /> : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <Checkbox id="published" name="published" label="Published" defaultChecked={event?.published ?? true} />
        <Checkbox id="registrationOpen" name="registrationOpen" label="Registration open" defaultChecked={event?.registrationOpen ?? true} />
        <Checkbox id="isDemo" name="isDemo" label="Mark as demonstration" defaultChecked={event?.isDemo ?? false} />
      </div>
      <FormStatus state={state} />
      <SubmitButton pending={pending} variant="navy" size="lg" pendingLabel="Saving…">
        {event ? "Save event" : "Create event"}
      </SubmitButton>
    </form>
  );
}
