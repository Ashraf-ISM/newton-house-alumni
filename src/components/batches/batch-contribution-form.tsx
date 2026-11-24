"use client";

import { CheckCircle2, Lock, Send } from "lucide-react";
import Link from "next/link";
import { submitBatchContributionAction } from "@/app/actions/community";
import { buttonVariants } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormAction } from "@/hooks/use-form-action";
import { cn } from "@/lib/utils";

export function BatchContributionForm({
  batchSlug,
  batchYear,
  canContribute,
}: {
  batchSlug: string;
  batchYear: number;
  canContribute: boolean;
}) {
  const [state, onSubmit, pending] = useFormAction(submitBatchContributionAction);
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  if (!canContribute) {
    return (
      <div className="rounded-lg border border-dashed border-gold-dark/45 bg-card p-7 text-center">
        <Lock className="mx-auto size-6 text-gold-dark" aria-hidden />
        <h3 className="mt-3 font-serif text-2xl text-navy">Contribute to Class of {batchYear}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-strong">
          Approved Newton House alumni can contribute batch photographs, memories, historical notes and reunion updates.
        </p>
        <Link
          href={`/login?next=${encodeURIComponent(`/alumni/batches/${batchSlug}`)}`}
          className={cn(buttonVariants({ variant: "navy", size: "md" }), "mt-5")}
        >
          Sign in as a Verified Alumnus
        </Link>
      </div>
    );
  }

  if (state?.ok) {
    return (
      <div className="rounded-lg border border-[#bcd8c4] bg-[#eef6f0] p-7 text-center text-[#1f4d33]">
        <CheckCircle2 className="mx-auto size-7" aria-hidden />
        <h3 className="mt-3 font-serif text-2xl">Contribution Submitted for Moderation</h3>
        <p className="mx-auto mt-2 max-w-md text-sm">{state.message}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      encType="multipart/form-data"
      className="space-y-5 bg-card p-6 shadow-soft ring-1 ring-line/80 sm:p-8"
    >
      <input type="hidden" name="batchSlug" value={batchSlug} />
      <input type="hidden" name="batchYear" value={batchYear} />

      <div>
        <p className="eyebrow text-gold-deep">Batch Contributions</p>
        <h3 className="mt-2 font-serif text-2xl text-navy">Share a Memory or Update for Class of {batchYear}</h3>
        <p className="mt-1 text-xs text-muted-strong">
          All submissions are reviewed by the Association before appearing publicly on this batch page.
        </p>
      </div>

      <FormStatus state={state} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="bc-type" label="Contribution type" required>
          {(a) => (
            <Select {...a} name="type" defaultValue="memory">
              <option value="memory">Batch Memory</option>
              <option value="photograph">Batch Photograph</option>
              <option value="historical_info">Historical Information</option>
              <option value="reunion_detail">Batch Reunion Detail</option>
            </Select>
          )}
        </Field>
        <Field id="bc-title" label="Headline / Title" required error={fe?.title}>
          {(a) => <Input {...a} name="title" placeholder="e.g. Farewell Evening in the Courtyard" />}
        </Field>
      </div>

      <Field id="bc-content" label="Memory, historical note or reunion details" required error={fe?.content}>
        {(a) => (
          <Textarea
            {...a}
            name="content"
            rows={4}
            placeholder="Share the story, names of fellow batch-mates, or verified details…"
          />
        )}
      </Field>

      <Field
        id="bc-photo"
        label="Batch photograph"
        error={fe?.photo}
        hint="Optional JPEG, PNG, WebP or AVIF up to 3 MB."
      >
        {(a) => (
          <Input
            {...a}
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="pt-2.5"
          />
        )}
      </Field>

      <SubmitButton pending={pending} variant="navy" pendingLabel="Submitting for moderation…">
        <Send aria-hidden /> Submit Batch Contribution
      </SubmitButton>
    </form>
  );
}
