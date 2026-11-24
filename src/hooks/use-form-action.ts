"use client";

import { useActionState, useTransition, type FormEvent } from "react";

/**
 * Wraps a server action for use with `onSubmit`. Unlike passing the action to
 * `<form action>`, this keeps the user's input intact when validation fails
 * (React resets uncontrolled forms after action submissions).
 */
export function useFormAction<S>(action: (prev: S | null, fd: FormData) => Promise<S>) {
  const [state, dispatch, actionPending] = useActionState<S | null, FormData>(action, null);
  const [transitionPending, startTransition] = useTransition();
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => dispatch(fd));
  };
  return [state, onSubmit, actionPending || transitionPending] as const;
}
