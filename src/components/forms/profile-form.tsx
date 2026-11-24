"use client";

import { Globe2, ImagePlus, Lock, Users } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { updateMyProfile } from "@/app/actions/auth";
import { adminSaveAlumni } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { SubmitButton } from "@/components/ui/submit-button";
import { departments, professions } from "@/data/alumni";
import { useFormAction } from "@/hooks/use-form-action";
import type { AlumniRecord } from "@/types";

const vis = [
  { value: "public", icon: Globe2, title: "Public" },
  { value: "members", icon: Users, title: "Members only" },
  { value: "private", icon: Lock, title: "Private" },
] as const;

/** Profile editor shared by the member portal (own profile) and the admin dashboard. */
export function ProfileForm({ alum, mode = "member" }: { alum: AlumniRecord; mode?: "member" | "admin" }) {
  const [state, onSubmit, pending] = useFormAction(mode === "admin" ? adminSaveAlumni : updateMyProfile);
  const fe = state && !state.ok ? state.fieldErrors : undefined;
  const [preview, setPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const current = removed ? null : (preview ?? alum.photoUrl);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <input type="hidden" name="id" value={alum.id} />
      {removed ? <input type="hidden" name="removePhoto" value="on" /> : null}

      {mode === "admin" ? (
        <div className="grid gap-5 sm:grid-cols-3">
          <Field id="fullName" label="Full name" required error={fe?.fullName} className="sm:col-span-3">
            {(a) => <Input {...a} name="fullName" defaultValue={alum.fullName} />}
          </Field>
          <Field id="graduationYear" label="Graduation year" required error={fe?.graduationYear}>
            {(a) => <Input {...a} name="graduationYear" inputMode="numeric" defaultValue={alum.graduationYear} />}
          </Field>
          <Field id="department" label="Department" required error={fe?.department} className="sm:col-span-2">
            {(a) => (
              <Select {...a} name="department" defaultValue={alum.department}>
                {departments.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      ) : (
        <div className="flex items-center gap-5">
          <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy text-gold ring-4 ring-ivory-2">
            {current ? (
              <Image src={current} alt="Your profile photograph" fill className="object-cover" unoptimized={current.startsWith("data:") || current.startsWith("blob:")} />
            ) : (
              <ImagePlus className="size-7" aria-hidden />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Profile photograph</p>
            <p className="text-xs text-muted-strong">JPEG, PNG, WebP or AVIF, up to 3 MB.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                ref={fileRef}
                id="photo"
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setRemoved(false);
                  setPreview(f ? URL.createObjectURL(f) : null);
                }}
              />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                {current ? "Change" : "Upload"}
              </Button>
              {current ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (fileRef.current) fileRef.current.value = "";
                    setPreview(null);
                    setRemoved(true);
                  }}
                >
                  Remove
                </Button>
              ) : null}
            </div>
            {fe?.photo ? <p role="alert" className="mt-1.5 text-[0.8125rem] font-medium text-brick">{fe.photo[0]}</p> : null}
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="designation" label="Designation" error={fe?.designation}>
          {(a) => <Input {...a} name="designation" defaultValue={alum.designation ?? ""} />}
        </Field>
        <Field id="organisation" label="Organisation" error={fe?.organisation}>
          {(a) => <Input {...a} name="organisation" defaultValue={alum.organisation ?? ""} />}
        </Field>
        <Field id="profession" label="Field" error={fe?.profession}>
          {(a) => (
            <Select {...a} name="profession" defaultValue={alum.profession ?? ""}>
              <option value="">Not specified</option>
              {professions.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
          )}
        </Field>
        <Field id="linkedinUrl" label="LinkedIn URL" error={fe?.linkedinUrl}>
          {(a) => <Input {...a} name="linkedinUrl" type="url" defaultValue={alum.linkedinUrl ?? ""} />}
        </Field>
        <Field id="city" label="City" error={fe?.city}>
          {(a) => <Input {...a} name="city" defaultValue={alum.city ?? ""} />}
        </Field>
        <Field id="country" label="Country" error={fe?.country}>
          {(a) => <Input {...a} name="country" defaultValue={alum.country ?? ""} />}
        </Field>
      </div>
      <Field id="bio" label="Short introduction" error={fe?.bio}>
        {(a) => <Textarea {...a} name="bio" maxLength={600} rows={5} defaultValue={alum.bio ?? ""} />}
      </Field>

      <fieldset>
        <legend className="mb-3 text-[0.8125rem] font-semibold text-ink">Profile visibility</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {vis.map((o) => (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-3 rounded-md border border-line bg-white p-4 transition-colors has-[:checked]:border-gold-dark has-[:checked]:bg-gold/[0.07] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-gold/25"
            >
              <input type="radio" name="visibility" value={o.value} defaultChecked={alum.visibility === o.value} className="accent-[#0b1f38]" />
              <o.icon className="size-4 text-gold-dark" aria-hidden />
              <span className="text-sm font-semibold text-ink">{o.title}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <Checkbox
        id="showEmail"
        name="showEmail"
        defaultChecked={alum.showEmail}
        label="Show my email address on my profile"
        description={`Currently: ${alum.email}. Only shown if your profile is visible to the viewer.`}
      />

      <FormStatus state={state} />
      <SubmitButton pending={pending} variant="navy" size="lg" pendingLabel="Saving…">
        Save changes
      </SubmitButton>
    </form>
  );
}
