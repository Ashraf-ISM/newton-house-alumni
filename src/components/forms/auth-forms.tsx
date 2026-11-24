"use client";

import { useState } from "react";
import { sendPasswordReset, signIn, updatePassword } from "@/app/actions/auth";
import { Field, Input } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormAction } from "@/hooks/use-form-action";

export function SignInForm({ next }: { next: string }) {
  const [state, onSubmit, pending] = useFormAction(signIn);
  const [reset, onReset, resetPending] = useFormAction(sendPasswordReset);
  const [mode, setMode] = useState<"signin" | "reset">("signin");
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  if (mode === "reset") {
    return (
      <form onSubmit={onReset} noValidate className="space-y-5">
        <Field id="reset-email" label="Email" required error={reset && !reset.ok ? reset.fieldErrors?.email : undefined}>
          {(a) => <Input {...a} name="email" type="email" autoComplete="email" />}
        </Field>
        <FormStatus state={reset} />
        <SubmitButton pending={resetPending} variant="navy" size="lg" className="w-full" pendingLabel="Sending…">
          Send reset link
        </SubmitButton>
        <button type="button" onClick={() => setMode("signin")} className="w-full text-center text-sm font-semibold text-gold-deep hover:underline">
          Back to sign in
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <Field id="si-email" label="Email" required error={fe?.email}>
        {(a) => <Input {...a} name="email" type="email" autoComplete="email" />}
      </Field>
      <Field id="si-password" label="Password" required error={fe?.password}>
        {(a) => <Input {...a} name="password" type="password" autoComplete="current-password" />}
      </Field>
      <div className="flex justify-end">
        <button type="button" onClick={() => setMode("reset")} className="text-sm font-semibold text-gold-deep hover:underline">
          Forgot password?
        </button>
      </div>
      <FormStatus state={state} />
      <SubmitButton pending={pending} variant="navy" size="lg" className="w-full" pendingLabel="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  );
}

export function UpdatePasswordForm() {
  const [state, onSubmit, pending] = useFormAction(updatePassword);
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field id="np" label="New password" required hint="At least 8 characters." error={state && !state.ok ? state.fieldErrors?.password : undefined}>
        {(a) => <Input {...a} name="password" type="password" autoComplete="new-password" minLength={8} />}
      </Field>
      <FormStatus state={state} />
      <SubmitButton pending={pending} variant="navy" pendingLabel="Saving…">
        Update password
      </SubmitButton>
    </form>
  );
}
