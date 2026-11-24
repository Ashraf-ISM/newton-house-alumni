import { Award, Globe2, GraduationCap, Users } from "lucide-react";
import { Counter } from "@/components/animations/counter";
import { Stagger, StaggerItem } from "@/components/animations/reveal";
import { impactStats } from "@/data/site";

const icons = { alumni: Users, heritage: GraduationCap, achievements: Award, global: Globe2 } as const;

/**
 * Community impact strip. Values come from `impactStats` in src/data/site.ts.
 * A `null` value is shown as "awaiting verification" — never an invented number.
 */
export function ImpactStats() {
  const anyPending = impactStats.some((s) => s.value === null);
  return (
    <section id="impact" aria-labelledby="impact-title" className="relative scroll-mt-20 border-y border-gold/10 bg-navy-deep text-ivory">
      <h2 id="impact-title" className="sr-only">
        Community impact
      </h2>
      <div className="container-nh">
        <Stagger as="ul" className="grid grid-cols-2 gap-px bg-gold/10 lg:grid-cols-4" stagger={0.1}>
          {impactStats.map((s) => {
            const Icon = icons[s.key as keyof typeof icons] ?? Users;
            return (
              <StaggerItem
                as="li"
                key={s.key}
                className="flex items-center gap-3 bg-navy-deep px-3 py-7 sm:gap-5 sm:px-6 sm:py-10 lg:justify-center"
              >
                <Icon className="size-7 shrink-0 text-gold sm:size-9" strokeWidth={1.25} aria-hidden />
                <div className="min-w-0">
                  {s.value !== null ? (
                    <>
                      <p className="font-serif text-[2.1rem] leading-none text-gold sm:text-[2.6rem]">
                        <Counter value={s.value} suffix={s.suffix} />
                      </p>
                      <p className="mt-1.5 text-[0.8125rem] text-ivory/75">{s.label}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-serif text-[1.15rem] leading-tight text-ivory min-[400px]:text-[1.3rem] sm:text-[1.6rem]">{s.label}</p>
                      <p className="mt-1.5 font-label text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-gold/85">
                        Figure being verified
                      </p>
                    </>
                  )}
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
        {anyPending ? (
          <p className="border-t border-gold/10 py-3 text-center text-[0.75rem] text-ivory/50">
            Community figures are published only after verification by the Association.
          </p>
        ) : null}
      </div>
    </section>
  );
}
