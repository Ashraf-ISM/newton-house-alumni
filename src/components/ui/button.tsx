import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "group/btn relative inline-flex select-none items-center justify-center gap-2.5 whitespace-nowrap rounded-full font-sans font-semibold tracking-[0.01em] transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:pointer-events-none disabled:opacity-55 active:translate-y-px [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        gold: "bg-gold text-navy shadow-[0_8px_24px_-12px_rgb(214_173_104_/_0.65)] hover:bg-[#e2bd7e]",
        navy: "bg-navy text-ivory hover:bg-navy-2",
        "outline-light": "border border-gold/55 text-ivory hover:border-gold hover:bg-white/[0.06]",
        outline: "border border-ink/20 text-ink hover:border-gold-dark hover:text-gold-deep",
        ghost: "text-ink hover:bg-ink/5",
        "ghost-light": "text-ivory/85 hover:bg-white/[0.06] hover:text-ivory",
        danger: "bg-brick text-white hover:bg-[#93422f]",
        link: "rounded-none px-0 text-gold-deep underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-[0.8125rem]",
        md: "h-11 px-6 text-sm",
        lg: "h-[3.25rem] px-7 text-[0.9375rem]",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "gold", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
