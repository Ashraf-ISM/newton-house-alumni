import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/animations/reveal";
import { Parallax } from "@/components/animations/parallax";
import { buttonVariants } from "@/components/ui/button";
import { images } from "@/data/images";
import { cn } from "@/lib/utils";

export function CommunityCTA() {
  return (
    <section aria-labelledby="cta-title" className="relative isolate overflow-hidden bg-navy py-28 text-ivory sm:py-36">
      <Parallax className="absolute inset-[-12%_0] -z-10" distance={60}>
        <Image src={images.facadeWestWing.src} alt="" fill sizes="100vw" quality={75} className="object-cover object-center" />
      </Parallax>
      <div aria-hidden className="absolute inset-0 -z-10 bg-navy/85" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgb(11_31_56_/_0.9)_75%)]" />

      <div className="container-nh text-center">
        <Reveal>
          <p className="eyebrow justify-center text-gold">Join the Brotherhood</p>
          <h2 id="cta-title" className="mx-auto mt-6 max-w-4xl text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-7xl">
            Your Newton House Story <span className="italic text-gold">Is Still Being Written.</span>
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-ivory/75">
            Reconnect with old friends, celebrate shared memories and become part of a growing alumni community.
          </p>
          <div className="mt-11 flex flex-col justify-center gap-3 min-[460px]:flex-row">
            <Link href="/join" className={cn(buttonVariants({ variant: "gold", size: "lg" }))}>
              Join the Alumni Network <ArrowRight aria-hidden className="transition-transform group-hover/btn:translate-x-1" />
            </Link>
            <Link href="/achievements" className={cn(buttonVariants({ variant: "outline-light", size: "lg" }))}>
              Explore Alumni Stories
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
