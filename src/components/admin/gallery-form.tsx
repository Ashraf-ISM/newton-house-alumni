"use client";

import { useEffect, useRef } from "react";
import { saveGalleryItem } from "@/app/actions/admin";
import { Checkbox, Field, Input, Select } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormAction } from "@/hooks/use-form-action";
import type { GalleryCategory } from "@/types";

export function GalleryForm({ categories }: { categories: GalleryCategory[] }) {
  const [state, onSubmit, pending] = useFormAction(saveGalleryItem);
  const fe = state && !state.ok ? state.fieldErrors : undefined;
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} onSubmit={onSubmit} noValidate className="space-y-5">
      <Field id="file" label="Photograph" required error={fe?.file} hint="Resized and converted to WebP automatically. Max 3 MB.">
        {(a) => <Input {...a} name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="pt-3" />}
      </Field>
      <Field id="imageUrl" label="…or existing image path" error={fe?.imageUrl} hint="For files already in /public/images. Set width and height below.">
        {(a) => <Input {...a} name="imageUrl" placeholder="/images/memories/farewell-2019.webp" />}
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field id="width" label="Width (px)" error={fe?.width}>
          {(a) => <Input {...a} name="width" inputMode="numeric" placeholder="1200" />}
        </Field>
        <Field id="height" label="Height (px)" error={fe?.height}>
          {(a) => <Input {...a} name="height" inputMode="numeric" placeholder="800" />}
        </Field>
      </div>
      <Field id="g-title" label="Title" required error={fe?.title}>
        {(a) => <Input {...a} name="title" />}
      </Field>
      <Field id="caption" label="Caption" error={fe?.caption}>
        {(a) => <Input {...a} name="caption" />}
      </Field>
      <Field id="alt" label="Alt text" required error={fe?.alt} hint="Describe what the photograph shows for screen-reader users.">
        {(a) => <Input {...a} name="alt" />}
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field id="categorySlug" label="Category" required error={fe?.categorySlug}>
          {(a) => (
            <Select {...a} name="categorySlug" defaultValue={categories[0]?.slug}>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field id="year" label="Year" error={fe?.year}>
          {(a) => <Input {...a} name="year" placeholder="e.g. 2014" />}
        </Field>
      </div>
      <Checkbox id="g-published" name="published" label="Publish immediately" defaultChecked />
      <FormStatus state={state} />
      <SubmitButton pending={pending} variant="navy" pendingLabel="Uploading…">
        Add photograph
      </SubmitButton>
    </form>
  );
}
