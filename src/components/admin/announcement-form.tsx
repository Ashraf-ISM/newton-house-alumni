"use client";

import { useEffect, useRef } from "react";
import { saveAnnouncement } from "@/app/actions/admin";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormAction } from "@/hooks/use-form-action";

export function AnnouncementForm() {
  const [state, onSubmit, pending] = useFormAction(saveAnnouncement);
  const fe = state && !state.ok ? state.fieldErrors : undefined;
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} onSubmit={onSubmit} noValidate className="space-y-5">
      <Field id="a-title" label="Title" required error={fe?.title}>
        {(a) => <Input {...a} name="title" />}
      </Field>
      <Field id="a-body" label="Announcement" required error={fe?.body}>
        {(a) => <Textarea {...a} name="body" rows={5} />}
      </Field>
      <Checkbox id="a-published" name="published" label="Publish now" description="Published announcements appear on the Events page." defaultChecked />
      <FormStatus state={state} />
      <SubmitButton pending={pending} variant="navy" pendingLabel="Saving…">
        Save announcement
      </SubmitButton>
    </form>
  );
}
