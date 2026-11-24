"use client";

import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  ImagePlus,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { m } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { submitAchievementNomination } from "@/app/actions/public";
import { Reveal } from "@/components/animations/reveal";
import { ArchitecturalLineArt } from "@/components/brand/line-art";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { SubmitButton } from "@/components/ui/submit-button";
import { achievementCategories } from "@/data/achievements";
import { departments } from "@/data/alumni";
import { useFormAction } from "@/hooks/use-form-action";
import { cn } from "@/lib/utils";

const workflowSteps = [
  {
    icon: Sparkles,
    title: "1. Submit or Nominate",
    body: "Share your own professional milestone or nominate a fellow Newton House alumnus.",
  },
  {
    icon: ClipboardCheck,
    title: "2. Association Verification",
    body: "The committee confirms details and consent with the member — no unverified claims are published.",
  },
  {
    icon: BadgeCheck,
    title: "3. Admin Approval & Publication",
    body: "Once approved in the Admin Dashboard, the profile appears live in the Distinguished Alumni directory.",
  },
];

export function AchievementSubmissionSection() {
  const [state, onSubmit, pending] = useFormAction(submitAchievementNomination);
  const fe = state && !state.ok ? state.fieldErrors : undefined;
  const [preview, setPreview] = useState<string | null>(null);
  const [summaryLen, setSummaryLen] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const focusForm = () => {
    formContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => nameInputRef.current?.focus(), 350);
  };

  return (
    <section
      id="submit-achievement"
      aria-labelledby="achievement-submit-title"
      className="relative scroll-mt-24 overflow-hidden border-t border-line bg-card py-20 lg:py-28"
    >
      <ArchitecturalLineArt className="pointer-events-none absolute -left-24 bottom-0 hidden w-[34rem] text-gold-dark/[0.08] lg:block" />

      <div className="container-nh relative grid gap-12 lg:grid-cols-12 lg:items-start">
        {/* Left Editorial Column */}
        <Reveal className="lg:sticky lg:top-28 lg:col-span-5">
          <p className="eyebrow text-gold-deep">Distinguished Alumni</p>
          <h2
            id="achievement-submit-title"
            className="mt-4 font-serif text-[2.25rem] leading-[1.06] text-navy sm:text-5xl"
          >
            Have an Achievement Worth Sharing?
          </h2>
          <p className="mt-5 text-[1.0625rem] leading-relaxed text-muted-strong">
            Share your professional journey and inspire future generations of Newton House.
          </p>

          <div className="mt-7">
            <Button variant="gold" size="lg" onClick={focusForm}>
              Submit Your Achievement
              <ArrowRight
                aria-hidden
                className="transition-transform duration-300 group-hover/btn:translate-x-0.5"
              />
            </Button>
          </div>

          {/* 3-Step Approval Workflow */}
          <ol className="mt-10 space-y-4 border-t border-line pt-8">
            {workflowSteps.map((step) => (
              <li key={step.title} className="flex items-start gap-3.5">
                <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-gold/45 bg-ivory text-gold-dark">
                  <step.icon className="size-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy">{step.title}</p>
                  <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-muted-strong">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-6 flex items-center gap-2 text-xs text-muted-strong">
            <ShieldCheck className="size-4 shrink-0 text-gold-dark" aria-hidden />
            <span>Your email is used strictly for verification and is never displayed publicly.</span>
          </p>
        </Reveal>

        {/* Right Form Column */}
        <Reveal delay={0.1} className="lg:col-span-7">
          <div
            ref={formContainerRef}
            className="scroll-mt-28 bg-ivory/75 p-6 shadow-soft ring-1 ring-line/90 sm:p-9 lg:p-10"
          >
            {state?.ok ? (
              <m.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-6 text-center"
              >
                <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-gold/20 text-gold-dark">
                  <CheckCircle2 className="size-7" aria-hidden />
                </span>
                <h3 className="mt-5 font-serif text-3xl text-navy">Submission Received for Verification</h3>
                <p role="status" className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-strong">
                  {state.message}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link href="/admin/achievements" className={cn(buttonVariants({ variant: "navy", size: "md" }))}>
                    Review in Admin Dashboard <ArrowRight aria-hidden />
                  </Link>
                  <Link href="/alumni" className={cn(buttonVariants({ variant: "outline", size: "md" }))}>
                    Explore Alumni Directory
                  </Link>
                </div>
              </m.div>
            ) : (
              <form
                onSubmit={onSubmit}
                noValidate
                encType="multipart/form-data"
                aria-label="Submit an alumni achievement"
                className="space-y-6"
              >
                <div className="border-b border-line pb-4">
                  <h3 className="font-serif text-2xl text-navy">Achievement Submission Form</h3>
                  <p className="mt-1 text-xs text-muted-strong">
                    Submissions enter the Association’s moderation queue and are published after verification. Fields
                    marked <span className="text-brick">*</span> are required.
                  </p>
                </div>

                <FormStatus state={state} />

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="ach-name" label="Alumnus full name" required error={fe?.name}>
                    {(a) => (
                      <Input
                        {...a}
                        ref={nameInputRef}
                        name="name"
                        autoComplete="name"
                        placeholder="Full name of the alumnus"
                      />
                    )}
                  </Field>
                  <Field
                    id="ach-email"
                    label="Your email (for verification)"
                    required
                    error={fe?.submitterEmail}
                  >
                    {(a) => <Input {...a} name="submitterEmail" type="email" autoComplete="email" />}
                  </Field>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <Field id="ach-year" label="Graduation year" error={fe?.graduationYear}>
                    {(a) => (
                      <Input
                        {...a}
                        name="graduationYear"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="e.g. 2012"
                      />
                    )}
                  </Field>
                  <Field id="ach-dept" label="Department" error={fe?.department}>
                    {(a) => (
                      <Select {...a} name="department" defaultValue="">
                        <option value="">Select department</option>
                        {departments.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </Select>
                    )}
                  </Field>
                  <Field id="ach-category" label="Category" required error={fe?.category}>
                    {(a) => (
                      <Select {...a} name="category" defaultValue="academics-research">
                        {achievementCategories.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </Select>
                    )}
                  </Field>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="ach-designation" label="Professional designation" required error={fe?.designation}>
                    {(a) => <Input {...a} name="designation" placeholder="e.g. Principal Scientist / Professor" />}
                  </Field>
                  <Field id="ach-organisation" label="Organisation / Institution" required error={fe?.organisation}>
                    {(a) => <Input {...a} name="organisation" placeholder="Current institution or organisation" />}
                  </Field>
                </div>

                <Field
                  id="ach-summary"
                  label="Achievement citation"
                  required
                  error={fe?.summary}
                  hint={`A concise one- or two-sentence summary (${summaryLen}/280 characters).`}
                >
                  {(a) => (
                    <Textarea
                      {...a}
                      name="summary"
                      rows={2}
                      maxLength={280}
                      className="min-h-20"
                      onChange={(e) => setSummaryLen(e.target.value.length)}
                      placeholder="Summarize the honour, appointment, research contribution or professional milestone…"
                    />
                  )}
                </Field>

                <Field
                  id="ach-biography"
                  label="Full story / short biography"
                  error={fe?.biography}
                  hint="Separate paragraphs with a blank line."
                >
                  {(a) => (
                    <Textarea
                      {...a}
                      name="biography"
                      rows={4}
                      maxLength={4000}
                      placeholder="Share the journey from Newton House to this milestone…"
                    />
                  )}
                </Field>

                <Field
                  id="ach-portrait"
                  label="Portrait photograph"
                  error={fe?.portrait}
                  hint="JPEG, PNG, WebP or AVIF up to 3 MB. EXIF location metadata is stripped automatically."
                >
                  {(a) => (
                    <div className="flex items-center gap-4">
                      <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/45 bg-navy text-gold">
                        {preview ? (
                          <Image
                            src={preview}
                            alt="Selected portrait preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <ImagePlus className="size-5" aria-hidden />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <input
                          {...a}
                          ref={fileRef}
                          name="portrait"
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          className="sr-only"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            setPreview(f ? URL.createObjectURL(f) : null);
                          }}
                        />
                        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                          {preview ? "Change portrait" : "Upload portrait"}
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

                <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

                <Checkbox
                  id="ach-consent"
                  name="consent"
                  error={fe?.consent}
                  label={
                    <>
                      I confirm that these details are factual and may be verified by the Newton House Alumni
                      Association prior to publication. <span className="text-brick">*</span>
                    </>
                  }
                />

                <div className="pt-2">
                  <SubmitButton
                    pending={pending}
                    variant="navy"
                    size="lg"
                    className="w-full sm:w-auto"
                    pendingLabel="Submitting for verification…"
                  >
                    Submit Your Achievement
                    <ArrowRight aria-hidden />
                  </SubmitButton>
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
