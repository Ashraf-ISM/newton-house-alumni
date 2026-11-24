"use client";

import { sendContactMessage } from "@/app/actions/public";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormAction } from "@/hooks/use-form-action";

export const contactSubjects = [
  "General enquiry",
  "Reunion & events",
  "Profile or directory help",
  "Photograph submission",
  "Memory submission",
  "Achievement nomination",
  "Volunteering",
];

export function ContactForm({ defaultSubject }: { defaultSubject?: string }) {
  const [state, onSubmit, pending] = useFormAction(sendContactMessage);
  const fe = state && !state.ok ? state.fieldErrors : undefined;
  const subject = defaultSubject && contactSubjects.includes(defaultSubject) ? defaultSubject : "General enquiry";

  if (state?.ok) return <FormStatus state={state} />;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="c-name" label="Your name" required error={fe?.name}>
          {(a) => <Input {...a} name="name" autoComplete="name" />}
        </Field>
        <Field id="c-email" label="Email" required error={fe?.email}>
          {(a) => <Input {...a} name="email" type="email" autoComplete="email" />}
        </Field>
      </div>
      <Field id="c-subject" label="Subject" required error={fe?.subject}>
        {(a) => (
          <Select {...a} name="subject" defaultValue={subject}>
            {contactSubjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field id="c-message" label="Message" required error={fe?.message}>
        {(a) => <Textarea {...a} name="message" rows={6} placeholder="Include your batch and department if you are an alumnus." />}
      </Field>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <FormStatus state={state} />
      <SubmitButton pending={pending} variant="navy" size="lg" pendingLabel="Sending…">
        Send message
      </SubmitButton>
    </form>
  );
}
