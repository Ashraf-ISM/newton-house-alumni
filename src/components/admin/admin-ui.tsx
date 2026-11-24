import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-4xl text-navy">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm text-muted-strong">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({ title, children, className, actions }: { title?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cn("bg-card shadow-soft ring-1 ring-line/70", className)}>
      {title ? (
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-label text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-strong">{title}</h2>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] text-left text-sm [&_td]:px-6 [&_td]:py-4 [&_td]:align-middle [&_th]:px-6 [&_th]:py-3 [&_th]:font-label [&_th]:text-[0.625rem] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.16em] [&_th]:text-muted-strong [&_tbody_tr]:border-t [&_tbody_tr]:border-line [&_tbody_tr:hover]:bg-ivory/60">
        {children}
      </table>
    </div>
  );
}

export function EmptyRow({ cols, children }: { cols: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={cols} className="!py-12 text-center text-muted-strong">
        {children}
      </td>
    </tr>
  );
}
