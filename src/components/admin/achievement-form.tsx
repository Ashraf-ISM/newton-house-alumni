"use client";

import { useState } from "react";
import { saveAchievement } from "@/app/actions/admin";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { SubmitButton } from "@/components/ui/submit-button";
import { achievementCategories } from "@/data/achievements";
import { useFormAction } from "@/hooks/use-form-action";
import { slugify } from "@/lib/utils";
import type { Achievement } from "@/types";

export function AchievementForm({ achievement: a }: { achievement?: Achievement }) {
  const [state, onSubmit, pending] = useFormAction(saveAchievement);
  const fe = state && !state.ok ? state.fieldErrors : undefined;
  const [slug, setSlug] = useState(a?.slug ?? "");
  const [touched, setTouched] = useState(!!a);
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {a ? <input type="hidden" name="id" value={a.id} /> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Name" required error={fe?.name}>
          {(x) => <Input {...x} name="name" defaultValue={a?.name} onChange={(e) => !touched && setSlug(slugify(e.target.value))} />}
        </Field>
        <Field id="slug" label="URL slug" required error={fe?.slug} hint={`/achievements/${slug || "…"}`}>
          {(x) => (
            <Input
              {...x}
              name="slug"
              value={slug}
              onChange={(e) => {
                setTouched(true);
                setSlug(e.target.value);
              }}
            />
          )}
        </Field>
        <Field id="designation" label="Designation" required error={fe?.designation}>
          {(x) => <Input {...x} name="designation" defaultValue={a?.designation} />}
        </Field>
        <Field id="organisation" label="Organisation" required error={fe?.organisation}>
          {(x) => <Input {...x} name="organisation" defaultValue={a?.organisation} />}
        </Field>
        <Field id="category" label="Category" required error={fe?.category}>
          {(x) => (
            <Select {...x} name="category" defaultValue={a?.category ?? "academics-research"}>
              {achievementCategories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field id="graduationYear" label="Graduation year" error={fe?.graduationYear}>
          {(x) => <Input {...x} name="graduationYear" inputMode="numeric" defaultValue={a?.graduationYear ?? ""} />}
        </Field>
      </div>
      <Field id="summary" label="Citation / summary" required error={fe?.summary}>
        {(x) => <Textarea {...x} name="summary" rows={2} className="min-h-20" defaultValue={a?.summary} />}
      </Field>
      <Field id="biography" label="Biography" error={fe?.biography} hint="Separate paragraphs with a blank line.">
        {(x) => <Textarea {...x} name="biography" rows={8} defaultValue={a?.biography.join("\n\n")} />}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="portrait" label="Portrait upload" error={fe?.portrait}>
          {(x) => <Input {...x} name="portrait" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="pt-3" />}
        </Field>
        <Field id="portraitUrl" label="…or portrait path / URL" error={fe?.portraitUrl}>
          {(x) => <Input {...x} name="portraitUrl" defaultValue={a?.portraitUrl?.startsWith("data:") ? "" : (a?.portraitUrl ?? "")} />}
        </Field>
      </div>
      {a?.portraitUrl?.startsWith("data:") ? <input type="hidden" name="portraitUrl" value={a.portraitUrl} /> : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <Checkbox id="published" name="published" label="Published" defaultChecked={a?.published ?? false} />
        <Checkbox id="verified" name="verified" label="Details verified with the member" defaultChecked={a?.verified ?? false} />
        <Checkbox id="isSample" name="isSample" label="Sample / demonstration" defaultChecked={a?.isSample ?? false} />
      </div>
      <FormStatus state={state} />
      <SubmitButton pending={pending} variant="navy" size="lg" pendingLabel="Saving…">
        {a ? "Save profile" : "Create profile"}
      </SubmitButton>
    </form>
  );
}
