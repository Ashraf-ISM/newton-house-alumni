"use client";

import { CheckCircle2, Globe2, ImagePlus, Lock, MailCheck, ShieldCheck, Users, X } from "lucide-react";
import { m } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { registerAlumni } from "@/app/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { SubmitButton } from "@/components/ui/submit-button";
import { departments, professions } from "@/data/alumni";
import { useFormAction } from "@/hooks/use-form-action";
import { cn } from "@/lib/utils";

const visibilityOptions = [
  { value: "public", icon: Globe2, title: "Public", body: "Anyone can find your profile in the directory." },
  { value: "members", icon: Users, title: "Members only", body: "Visible only to signed-in, approved alumni." },
  { value: "private", icon: Lock, title: "Private", body: "Hidden from the directory. Only admins can see it." },
] as const;

function Fieldset({ step, title, description, children }: { step: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-6 border-t border-line pt-10 first-of-type:border-t-0 first-of-type:pt-0 lg:grid-cols-12 lg:gap-10">
      <legend className="sr-only">{title}</legend>
      <div className="lg:col-span-4">
        <p className="font-serif text-lg italic text-gold-deep">{step}</p>
        <h2 className="mt-1 font-serif text-[1.75rem] leading-tight text-navy">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-relaxed text-muted-strong">{description}</p> : null}
      </div>
      <div className="space-y-5 lg:col-span-8">{children}</div>
    </fieldset>
  );
}

export function JoinForm({ requiresPassword, demo }: { requiresPassword: boolean; demo: boolean }) {
  const [state, onSubmit, pending] = useFormAction(registerAlumni);
  const fe = state && !state.ok ? state.fieldErrors : undefined;
  const [preview, setPreview] = useState<string | null>(null);
  const [bioLen, setBioLen] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const year = new Date().getFullYear();

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => {
    if (state) topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [state]);

  if (state?.ok) {
    return (
      <m.div ref={topRef} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl scroll-mt-32 bg-card p-8 text-center shadow-lift ring-1 ring-line/70 sm:p-12">
        <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-gold/15 text-gold-dark">
          <CheckCircle2 className="size-8" aria-hidden />
        </span>
        <h2 className="mt-6 font-serif text-4xl text-navy">Welcome home.</h2>
        <p role="status" className="mx-auto mt-4 max-w-md leading-relaxed text-muted-strong">
          {state.message}
        </p>
        <ol className="mx-auto mt-10 grid max-w-lg gap-px overflow-hidden bg-line text-left sm:grid-cols-3">
          {[
            { icon: MailCheck, t: "Verify email", d: demo ? "Skipped in demo mode" : "Click the link we sent" },
            { icon: ShieldCheck, t: "Admin review", d: "The Association confirms your details" },
            { icon: Users, t: "Profile live", d: "Visible as per your privacy choice" },
          ].map((s, i) => (
            <li key={s.t} className="bg-ivory p-4">
              <s.icon className="size-5 text-gold-dark" aria-hidden />
              <p className="mt-2 text-sm font-semibold text-ink">
                {i + 1}. {s.t}
              </p>
              <p className="mt-0.5 text-xs text-muted-strong">{s.d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/alumni" className={cn(buttonVariants({ variant: "navy" }))}>
            Browse the directory
          </Link>
          {demo ? (
            <Link href="/admin/alumni" className={cn(buttonVariants({ variant: "outline" }))}>
              Review in admin dashboard
            </Link>
          ) : (
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
              Return home
            </Link>
          )}
        </div>
      </m.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate encType="multipart/form-data" className="space-y-10" aria-describedby="join-required-note">
      <div ref={topRef} className="scroll-mt-32">
        <FormStatus state={state} className="mb-4" />
        <p id="join-required-note" className="text-sm text-muted-strong">
          Fields marked <span className="text-brick">*</span> are required.
        </p>
      </div>

      <Fieldset step="I." title="About you" description="Your name and email are used to verify your registration. Your email is never shown without your consent.">
        <Field id="fullName" label="Full name" required error={fe?.fullName}>
          {(a) => <Input {...a} name="fullName" autoComplete="name" placeholder="As you were known at Newton House" />}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="email" label="Email" required error={fe?.email}>
            {(a) => <Input {...a} name="email" type="email" autoComplete="email" />}
          </Field>
          {requiresPassword ? (
            <Field id="password" label="Create a password" required error={fe?.password} hint="At least 8 characters.">
              {(a) => <Input {...a} name="password" type="password" autoComplete="new-password" minLength={8} />}
            </Field>
          ) : null}
        </div>
      </Fieldset>

      <Fieldset step="II." title="Your Newton House years">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="graduationYear" label="Graduation year" required error={fe?.graduationYear}>
            {(a) => <Input {...a} name="graduationYear" inputMode="numeric" maxLength={4} placeholder={`e.g. ${year - 10}`} />}
          </Field>
          <Field id="department" label="Department" required error={fe?.department}>
            {(a) => (
              <Select {...a} name="department" defaultValue="">
                <option value="" disabled>
                  Choose your department
                </option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      </Fieldset>

      <Fieldset step="III." title="Where life has taken you" description="Help fellow alumni find you by profession and place.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="designation" label="Professional designation" error={fe?.designation}>
            {(a) => <Input {...a} name="designation" autoComplete="organization-title" placeholder="e.g. Research Scientist" />}
          </Field>
          <Field id="organisation" label="Current organisation" error={fe?.organisation}>
            {(a) => <Input {...a} name="organisation" autoComplete="organization" />}
          </Field>
          <Field id="profession" label="Field" error={fe?.profession}>
            {(a) => (
              <Select {...a} name="profession" defaultValue="">
                <option value="">Choose a field</option>
                {professions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field id="city" label="Current city" error={fe?.city}>
            {(a) => <Input {...a} name="city" autoComplete="address-level2" />}
          </Field>
        </div>
        <Field id="linkedinUrl" label="LinkedIn URL" error={fe?.linkedinUrl}>
          {(a) => <Input {...a} name="linkedinUrl" type="url" inputMode="url" placeholder="https://www.linkedin.com/in/your-name" />}
        </Field>
      </Fieldset>

      <Fieldset step="IV." title="Your profile" description="A recent photograph and a few lines help batch-mates recognise you.">
        <Field id="photo" label="Profile photograph" error={fe?.photo} hint="JPEG, PNG, WebP or AVIF, up to 3 MB. Location data is removed automatically.">
          {(a) => (
            <div className="flex items-center gap-5">
              <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy text-gold ring-4 ring-ivory-2">
                {preview ? <Image src={preview} alt="Selected photograph preview" fill className="object-cover" unoptimized /> : <ImagePlus className="size-7" aria-hidden />}
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  {...a}
                  ref={fileRef}
                  name="photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setPreview(f ? URL.createObjectURL(f) : null);
                  }}
                />
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  {preview ? "Change photograph" : "Upload photograph"}
                </Button>
                {preview ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (fileRef.current) fileRef.current.value = "";
                      setPreview(null);
                    }}
                  >
                    <X aria-hidden /> Remove
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </Field>
        <Field id="bio" label="Short introduction" error={fe?.bio} hint={`${bioLen}/600 characters`}>
          {(a) => (
            <Textarea
              {...a}
              name="bio"
              maxLength={600}
              rows={5}
              onChange={(e) => setBioLen(e.target.value.length)}
              placeholder="Your years at Newton House, what you do now, and how batch-mates can reach out."
            />
          )}
        </Field>
      </Fieldset>

      <Fieldset step="V." title="Privacy" description="You can change these settings at any time from the member portal.">
        <div role="radiogroup" aria-labelledby="visibility-label" aria-describedby={fe?.visibility ? "visibility-error" : undefined}>
          <p id="visibility-label" className="mb-3 text-[0.8125rem] font-semibold text-ink">
            Who can see your profile? <span className="text-brick" aria-hidden>*</span>
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {visibilityOptions.map((o) => (
              <label
                key={o.value}
                className="group relative flex cursor-pointer flex-col rounded-md border border-line bg-white p-4 transition-colors has-[:checked]:border-gold-dark has-[:checked]:bg-gold/[0.07] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-gold/25"
              >
                <input type="radio" name="visibility" value={o.value} defaultChecked={o.value === "members"} className="sr-only" />
                <o.icon className="size-5 text-gold-dark" aria-hidden />
                <span className="mt-3 text-sm font-semibold text-ink">{o.title}</span>
                <span className="mt-1 text-xs leading-relaxed text-muted-strong">{o.body}</span>
                <CheckCircle2 className="absolute right-3 top-3 size-4 text-gold-dark opacity-0 transition-opacity group-has-[:checked]:opacity-100" aria-hidden />
              </label>
            ))}
          </div>
          {fe?.visibility ? (
            <p id="visibility-error" role="alert" className="mt-1.5 text-[0.8125rem] font-medium text-brick">
              {fe.visibility[0]}
            </p>
          ) : null}
        </div>
        <Checkbox id="showEmail" name="showEmail" label="Show my email address on my profile" description="Off by default. Only applies if your profile is visible." />
        <Checkbox
          id="consent"
          name="consent"
          error={fe?.consent}
          label={
            <>
              I confirm I was a resident of Newton House and that these details are accurate. I agree that the Association may review them before
              publishing. <span className="text-brick" aria-hidden>*</span>
            </>
          }
        />
      </Fieldset>

      <div className="flex flex-col items-start gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-strong">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-gold-deep hover:underline">
            Sign in
          </Link>
        </p>
        <SubmitButton pending={pending} size="lg" pendingLabel="Submitting…">
          Submit registration
        </SubmitButton>
      </div>
    </form>
  );
}
