"use client";

import { KeyRound, Lock, ShieldAlert, UserCheck } from "lucide-react";
import { useRef, useState } from "react";
import { sendPasswordReset, signIn, updatePassword } from "@/app/actions/auth";
import { Field, Input } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormAction } from "@/hooks/use-form-action";

export function SignInForm({ next, showLocalAccounts = false }: { next: string; showLocalAccounts?: boolean }) {
  const [state, onSubmit, pending] = useFormAction(signIn);
  const [reset, onReset, resetPending] = useFormAction(sendPasswordReset);
  const [mode, setMode] = useState<"signin" | "reset">("signin");
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  const fillCredentials = (email: string, pass: string) => {
    if (emailRef.current) emailRef.current.value = email;
    if (passwordRef.current) passwordRef.current.value = pass;
    emailRef.current?.focus();
  };

  if (mode === "reset") {
    return (
      <form onSubmit={onReset} noValidate className="space-y-5">
        <Field
          id="reset-email"
          label="Registered email"
          required
          error={reset && !reset.ok ? reset.fieldErrors?.email : undefined}
        >
          {(a) => <Input {...a} name="email" type="email" autoComplete="email" />}
        </Field>
        <FormStatus state={reset} />
        <SubmitButton pending={resetPending} variant="navy" size="lg" className="w-full" pendingLabel="Sending…">
          Send password reset link
        </SubmitButton>
        <button
          type="button"
          onClick={() => setMode("signin")}
          className="w-full text-center text-sm font-semibold text-gold-deep hover:underline"
        >
          Back to sign in
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <input type="hidden" name="next" value={next} />
        <Field id="si-email" label="Email address" required error={fe?.email}>
          {(a) => (
            <Input
              {...a}
              ref={emailRef}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          )}
        </Field>
        <Field id="si-password" label="Password" required error={fe?.password}>
          {(a) => (
            <Input
              {...a}
              ref={passwordRef}
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
            />
          )}
        </Field>
        <div className="flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1.5 text-muted-strong">
            <Lock className="size-3.5 text-gold-dark" aria-hidden />
            Authorised members &amp; admins only
          </span>
          <button
            type="button"
            onClick={() => setMode("reset")}
            className="font-semibold text-gold-deep hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <FormStatus state={state} />
        <SubmitButton pending={pending} variant="navy" size="lg" className="w-full" pendingLabel="Verifying…">
          <KeyRound aria-hidden />
          Sign in to Newton House
        </SubmitButton>
      </form>

      {showLocalAccounts ? (
        <div className="rounded-md border border-dashed border-gold-dark/45 bg-ivory/80 p-4 text-xs">
          <p className="font-label text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            Authorised Test Credentials (Click to autofill)
          </p>
          <p className="mt-1 text-muted-strong">
            Use these pre-seeded accounts to test role-based access control, or register a new alumnus on{" "}
            <strong className="text-ink">/join</strong> and approve them as Admin:
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => fillCredentials("admin@newtonhouse.org", "NewtonAdmin@2026")}
              className="flex flex-col items-start rounded border border-line bg-white p-2.5 text-left transition-colors hover:border-gold-dark"
            >
              <span className="inline-flex items-center gap-1.5 font-semibold text-navy">
                <ShieldAlert className="size-3.5 text-brick" aria-hidden />
                Administrator
              </span>
              <span className="mt-1 font-mono text-[0.7rem] text-muted-strong">admin@newtonhouse.org</span>
              <span className="font-mono text-[0.7rem] text-muted">NewtonAdmin@2026</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("member@newtonhouse.org", "NewtonMember@2026")}
              className="flex flex-col items-start rounded border border-line bg-white p-2.5 text-left transition-colors hover:border-gold-dark"
            >
              <span className="inline-flex items-center gap-1.5 font-semibold text-navy">
                <UserCheck className="size-3.5 text-gold-dark" aria-hidden />
                Approved Alumnus
              </span>
              <span className="mt-1 font-mono text-[0.7rem] text-muted-strong">member@newtonhouse.org</span>
              <span className="font-mono text-[0.7rem] text-muted">NewtonMember@2026</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function UpdatePasswordForm() {
  const [state, onSubmit, pending] = useFormAction(updatePassword);
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field
        id="np"
        label="New password"
        required
        hint="At least 8 characters."
        error={state && !state.ok ? state.fieldErrors?.password : undefined}
      >
        {(a) => <Input {...a} name="password" type="password" autoComplete="new-password" minLength={8} />}
      </Field>
      <FormStatus state={state} />
      <SubmitButton pending={pending} variant="navy" pendingLabel="Saving…">
        Update password
      </SubmitButton>
    </form>
  );
}
