import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-label text-[0.625rem] font-semibold uppercase tracking-[0.14em] leading-none",
  {
    variants: {
      variant: {
        sample: "border border-dashed border-gold-dark/60 bg-gold/10 px-2.5 py-1.5 text-gold-deep",
        "sample-dark": "border border-dashed border-gold/50 bg-gold/10 px-2.5 py-1.5 text-gold",
        neutral: "bg-ivory-2 px-2.5 py-1.5 text-ink",
        gold: "bg-gold px-2.5 py-1.5 text-navy",
        success: "bg-[#e3efe6] px-2.5 py-1.5 text-[#22553a]",
        warning: "bg-[#f6ead2] px-2.5 py-1.5 text-[#7a5413]",
        danger: "bg-[#f5e1dc] px-2.5 py-1.5 text-[#8a3622]",
        outline: "border border-line px-2.5 py-1.5 text-muted-strong",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
