import * as React from "react";
import { cn } from "@/lib/utils";

const control =
  "block w-full rounded-md border border-line bg-white px-4 text-[0.9375rem] text-ink placeholder:text-muted/80 transition-[border-color,box-shadow] duration-200 focus:border-gold-dark focus:outline-none focus:ring-4 focus:ring-gold/20 disabled:bg-ivory-2 disabled:text-muted aria-[invalid=true]:border-brick aria-[invalid=true]:focus:ring-brick/15";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(control, "h-12", className)} {...props} />;
  },
);

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(control, "min-h-32 py-3 leading-relaxed", className)} {...props} />;
  },
);

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <div className="relative">
        <select ref={ref} className={cn(control, "h-12 appearance-none pr-10", className)} {...props}>
          {children}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
        >
          <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
    );
  },
);

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-2 block text-[0.8125rem] font-semibold text-ink", className)} {...props} />;
}

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string[] | string;
  required?: boolean;
  className?: string;
  children: (a11y: { id: string; "aria-invalid"?: boolean; "aria-describedby"?: string; required?: boolean }) => React.ReactNode;
}

/** Accessible form field: label, control, hint and error wired with aria attributes. */
export function Field({ id, label, hint, error, required, className, children }: FieldProps) {
  const err = Array.isArray(error) ? error[0] : error;
  const describedBy = [hint ? `${id}-hint` : null, err ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <Label htmlFor={id}>
        {label}
        {required ? <span className="ml-0.5 text-brick" aria-hidden>*</span> : <span className="ml-1.5 font-normal text-muted">(optional)</span>}
      </Label>
      {children({ id, "aria-invalid": err ? true : undefined, "aria-describedby": describedBy, required })}
      {hint && !err ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[0.8125rem] text-muted-strong">
          {hint}
        </p>
      ) : null}
      {err ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-[0.8125rem] font-medium text-brick">
          {err}
        </p>
      ) : null}
    </div>
  );
}

export function Checkbox({
  id,
  name,
  label,
  description,
  defaultChecked,
  error,
}: {
  id: string;
  name: string;
  label: React.ReactNode;
  description?: string;
  defaultChecked?: boolean;
  error?: string[];
}) {
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          defaultChecked={defaultChecked}
          aria-invalid={error?.length ? true : undefined}
          className="mt-0.5 size-[1.125rem] shrink-0 cursor-pointer rounded border-line accent-[#0b1f38]"
        />
        <span>
          <span className="block text-sm font-medium text-ink">{label}</span>
          {description ? <span className="mt-0.5 block text-[0.8125rem] text-muted-strong">{description}</span> : null}
        </span>
      </label>
      {error?.[0] ? (
        <p role="alert" className="mt-1.5 pl-[1.875rem] text-[0.8125rem] font-medium text-brick">
          {error[0]}
        </p>
      ) : null}
    </div>
  );
}
