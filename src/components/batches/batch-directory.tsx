"use client";

import { ArrowRight, GraduationCap, RotateCcw, Search, Users } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { departments, professions } from "@/data/alumni";
import type { BatchSummary } from "@/lib/data/community";
import { cn } from "@/lib/utils";

const selectCls =
  "h-11 w-full appearance-none rounded-md border border-line bg-white pl-3.5 pr-8 text-sm text-ink transition-colors focus:border-gold-dark focus:outline-none focus:ring-4 focus:ring-gold/20";

export function BatchDirectory({ batches }: { batches: BatchSummary[] }) {
  const [q, setQ] = useState("");
  const [residenceYear, setResidenceYear] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [department, setDepartment] = useState("");
  const [city, setCity] = useState("");
  const [profession, setProfession] = useState("");

  const filterOptions = useMemo(() => {
    const gradYears = [...new Set(batches.map((b) => b.year))].sort((a, b) => b - a);
    const resYears = [...new Set(batches.map((b) => b.year - 3))].sort((a, b) => b - a);
    const cities = [
      ...new Set(
        batches.flatMap((b) => b.members.map((m) => m.city).filter((c): c is string => Boolean(c))),
      ),
    ].sort();
    return { gradYears, resYears, cities };
  }, [batches]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return batches.filter((b) => {
      if (graduationYear && String(b.year) !== graduationYear) return false;
      if (residenceYear && String(b.year - 3) !== residenceYear) return false;
      if (department && !b.members.some((m) => m.department === department)) return false;
      if (city && !b.members.some((m) => m.city === city)) return false;
      if (profession && !b.members.some((m) => m.profession === profession)) return false;
      if (needle) {
        const hay = [
          b.title,
          b.residencePeriod,
          String(b.year),
          b.description,
          ...b.members.flatMap((m) => [m.fullName, m.department, m.city, m.organisation, m.designation]),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [batches, q, graduationYear, residenceYear, department, city, profession]);

  const hasFilters = Boolean(q || residenceYear || graduationYear || department || city || profession);
  const reset = () => {
    setQ("");
    setResidenceYear("");
    setGraduationYear("");
    setDepartment("");
    setCity("");
    setProfession("");
  };

  return (
    <div>
      {/* Search & 5 Filters */}
      <div className="rounded-lg border border-line bg-card p-5 shadow-soft sm:p-6">
        <div className="relative">
          <label htmlFor="batch-q" className="sr-only">
            Search batches or alumni
          </label>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            id="batch-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by batch year, residence period, alumnus name, department or city…"
            className="h-12 w-full rounded-full border border-line bg-ivory/60 pl-11 pr-4 text-sm text-ink placeholder:text-muted focus:border-gold-dark focus:bg-white focus:outline-none focus:ring-4 focus:ring-gold/20"
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label
              htmlFor="bf-res"
              className="mb-1 block font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-strong"
            >
              Residence Year
            </label>
            <select
              id="bf-res"
              value={residenceYear}
              onChange={(e) => setResidenceYear(e.target.value)}
              className={selectCls}
            >
              <option value="">All entry years</option>
              {filterOptions.resYears.map((y) => (
                <option key={y} value={y}>
                  Entered {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="bf-grad"
              className="mb-1 block font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-strong"
            >
              Graduation Year
            </label>
            <select
              id="bf-grad"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              className={selectCls}
            >
              <option value="">All graduation years</option>
              {filterOptions.gradYears.map((y) => (
                <option key={y} value={y}>
                  Class of {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="bf-dept"
              className="mb-1 block font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-strong"
            >
              Department
            </label>
            <select
              id="bf-dept"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className={selectCls}
            >
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="bf-city"
              className="mb-1 block font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-strong"
            >
              Current City
            </label>
            <select
              id="bf-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={selectCls}
            >
              <option value="">All cities</option>
              {filterOptions.cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="bf-prof"
              className="mb-1 block font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-strong"
            >
              Professional Field
            </label>
            <select
              id="bf-prof"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className={selectCls}
            >
              <option value="">All fields</option>
              {professions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-3 text-xs text-muted-strong">
          <span aria-live="polite">
            Showing <strong className="font-semibold text-navy">{filtered.length}</strong> of{" "}
            <strong className="font-semibold text-navy">{batches.length}</strong> Newton House cohorts
          </span>
          {hasFilters ? (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 font-semibold text-gold-deep hover:underline"
            >
              <RotateCcw className="size-3" aria-hidden /> Reset filters
            </button>
          ) : null}
        </div>
      </div>

      {/* Batch Cards Grid */}
      {filtered.length > 0 ? (
        <m.ul layout className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((batch, idx) => (
              <m.li
                key={batch.slug}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, delay: Math.min(idx * 0.04, 0.25) }}
              >
                <article className="group relative flex h-full flex-col justify-between overflow-hidden bg-card shadow-soft ring-1 ring-line/85 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-lift">
                  {/* Top visual header or editorial yearbook banner */}
                  <div className="relative h-44 overflow-hidden bg-navy text-ivory">
                    {batch.photoUrl ? (
                      <Image
                        src={batch.photoUrl}
                        alt={`Newton House ${batch.title}`}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                        className="object-cover opacity-55 transition-transform duration-1000 group-hover:scale-105"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-navy/30" />

                    <div className="relative flex h-full flex-col justify-between p-5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/35 bg-navy/70 px-3 py-1 font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-gold">
                          <GraduationCap className="size-3" aria-hidden />
                          {batch.residencePeriod}
                        </span>
                        {batch.isSample ? <Badge variant="sample-dark">Sample Cohort</Badge> : null}
                      </div>

                      <div>
                        <h3 className="font-serif text-3xl leading-none text-ivory">{batch.title}</h3>
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gold">
                          <Users className="size-3.5" aria-hidden />
                          <span className="tabular-nums">{batch.memberCount}</span> verified{" "}
                          {batch.memberCount === 1 ? "member" : "members"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Body: Description & Department Distribution */}
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <p className="line-clamp-2 text-sm leading-relaxed text-muted-strong">{batch.description}</p>

                      <div className="mt-5">
                        <p className="font-label text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-muted-strong">
                          Department Distribution
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {batch.departments.map((d) => (
                            <span
                              key={d.department}
                              className="inline-flex items-center gap-1.5 rounded-full bg-ivory px-2.5 py-1 text-xs font-medium text-navy ring-1 ring-line"
                            >
                              {d.department}
                              <span className="rounded-full bg-gold/25 px-1.5 py-0.2 text-[0.68rem] font-bold text-gold-deep tabular-nums">
                                {d.count}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-line/70 pt-4">
                      <Link
                        href={`/alumni/batches/${batch.slug}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full justify-between")}
                      >
                        <span>Explore Batch</span>
                        <ArrowRight
                          className="size-3.5 transition-transform group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </Link>
                    </div>
                  </div>
                </article>
              </m.li>
            ))}
          </AnimatePresence>
        </m.ul>
      ) : (
        <div className="mt-10 rounded-lg border border-dashed border-line bg-card p-14 text-center">
          <p className="font-serif text-3xl text-navy">No batches match your filters</p>
          <p className="mt-2 text-sm text-muted-strong">
            Try clearing a filter or register your own profile to establish your cohort.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-deep hover:underline"
          >
            <RotateCcw className="size-3.5" aria-hidden /> Reset all filters
          </button>
        </div>
      )}
    </div>
  );
}
