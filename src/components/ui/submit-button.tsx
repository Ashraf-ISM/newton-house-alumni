"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "./button";

export function SubmitButton({
  children,
  pendingLabel = "Please wait…",
  pending: pendingProp,
  ...props
}: ButtonProps & { pendingLabel?: string; pending?: boolean }) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  return (
    <Button type="submit" disabled={pending || props.disabled} aria-disabled={pending} {...props}>
      {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
      {pending ? pendingLabel : children}
    </Button>
  );
}
