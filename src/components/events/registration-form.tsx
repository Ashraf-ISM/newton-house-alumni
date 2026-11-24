"use client";

import { registerForEvent } from "@/app/actions/public";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormAction } from "@/hooks/use-form-action";

export function EventRegistrationForm({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const [state, onSubmit, pending] = useFormAction(registerForEvent);
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  if (state?.ok) {
    return (
      <div className="space-y-4">
        <FormStatus state={state} />
        <p className="text-sm text-muted-strong">Want to bring more friends from your batch? Share this page with them.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5" aria-label={`Register for ${eventTitle}`}>
      <input type="hidden" name="eventId" value={eventId} />
      <Field id="reg-name" label="Full name" required error={fe?.fullName}>
        {(a) => <Input {...a} name="fullName" autoComplete="name" />}
      </Field>
      <Field id="reg-email" label="Email" required error={fe?.email} hint="We’ll send event updates here. It is never shown publicly.">
        {(a) => <Input {...a} name="email" type="email" autoComplete="email" />}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="reg-year" label="Graduation year" error={fe?.graduationYear}>
          {(a) => <Input {...a} name="graduationYear" inputMode="numeric" placeholder="e.g. 2012" maxLength={4} />}
        </Field>
        <Field id="reg-guests" label="Additional guests" required error={fe?.guests}>
          {(a) => (
            <Select {...a} name="guests" defaultValue="0">
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? "Just me" : `+${n}`}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
      <Field id="reg-note" label="Anything we should know?" error={fe?.note}>
        {(a) => <Textarea {...a} name="note" rows={3} className="min-h-24" placeholder="Dietary needs, accessibility, batch-mates you’re coming with…" />}
      </Field>
      <FormStatus state={state} />
      <SubmitButton pending={pending} variant="navy" size="lg" className="w-full" pendingLabel="Registering…">
        Confirm registration
      </SubmitButton>
    </form>
  );
}
