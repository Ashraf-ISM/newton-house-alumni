import Link from "next/link";
import { ArchitecturalLineArt } from "@/components/brand/line-art";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-navy pt-24 text-ivory">
      <ArchitecturalLineArt className="absolute bottom-0 left-1/2 w-[52rem] max-w-none -translate-x-1/2 text-gold/10" />
      <div className="container-nh relative text-center">
        <p className="eyebrow justify-center text-gold">Error 404</p>
        <h1 className="mt-6 text-5xl sm:text-7xl">This corridor leads nowhere.</h1>
        <p className="mx-auto mt-5 max-w-md text-ivory/70">The page you were looking for has moved or never existed. Let us walk you back to the house.</p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className={cn(buttonVariants({ variant: "gold", size: "lg" }))}>Return home</Link>
          <Link href="/alumni" className={cn(buttonVariants({ variant: "outline-light", size: "lg" }))}>Find an alumnus</Link>
        </div>
      </div>
    </section>
  );
}
