"use client";

import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { ActionResult } from "@/types";
import { toast } from "./toaster";

/** Runs a bound server action with optional confirmation, pending state and toast feedback. */
export function ActionButton({
  action,
  confirmMessage,
  children,
  ...props
}: Omit<ButtonProps, "onClick"> & { action: () => Promise<ActionResult>; confirmMessage?: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      {...props}
      disabled={pending || props.disabled}
      onClick={() => {
        if (confirmMessage && !window.confirm(confirmMessage)) return;
        start(async () => {
          const res = await action();
          toast(res.ok, res.message);
        });
      }}
    >
      {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
      {children}
    </Button>
  );
}
