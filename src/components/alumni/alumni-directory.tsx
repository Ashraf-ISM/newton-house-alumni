"use client";

import { ArrowDownAZ, Search, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AlumniProfile } from "@/types";
import { AlumniCard } from "./alumni-card";

const PAGE_SIZE = 12;

type SortKey = "az" | "za" | "recent" | "earliest";
const sortLabels: Record<SortKey, string> = {
  az: "Name A–Z",
  za: "Name Z–A",
  recent: "Most recent batch",
  earliest: "Earliest batch",
};

const selectCls =
  "h-11 w-full appearance-none rounded-md border border-line bg-white pl-3.5 pr-9 text-sm text-ink transition-colors focus:border-gold-dark focus:outline-none focus:ring-4 focus:ring-gold/20";

function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  allLabel: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-strong">
        {label}
      </label>
      <div className="relative">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>
          <option value="">{allLabel}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted">
          <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

export function AlumniDirectory({ alumni, memberView }: { alumni: AlumniProfile[]; memberView: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [year, setYear] = useState(params.get("year") ?? "");
  const [dept, setDept] = useState(params.get("department") ?? "");
  const [prof, setProf] = useState(params.get("profession") ?? "");
  const [loc, setLoc] = useState(params.get("location") ?? "");
  const [sort, setSort] = useState<SortKey>((params.get("sort") as SortKey) || "az");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const deferredQ = useDeferredValue(q);

  const options = useMemo(() => {
    const uniq = (arr: (string | null | number)[]) => [...new Set(arr.filter((x): x is string | number => x !== null && x !== ""))];
    const years = (uniq(alumni.map((a) => a.graduationYear)) as number[]).sort((a, b) => b - a);
    return {
      years: years.map((y) => ({ value: String(y), label: String(y) })),
      depts: (uniq(alumni.map((a) => a.department)) as string[]).sort().map((d) => ({ value: d, label: d })),
      profs: (uniq(alumni.map((a) => a.profession)) as string[]).sort().map((d) => ({ value: d, label: d })),
      locs: (uniq(alumni.flatMap((a) => [a.city, a.country])) as string[]).sort().map((d) => ({ value: d, label: d })),
    };
  }, [alumni]);

  const syncUrl = (next: Record<string, string>) => {
    const sp = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => (v ? sp.set(k, v) : sp.delete(k)));
    if (sp.get("sort") === "az") sp.delete("sort");
    startTransition(() => router.replace(`${pathname}${sp.size ? `?${sp}` : ""}`, { scroll: false }));
  };

  const set =
    (setter: (v: string) => void, key: string) =>
    (v: string) => {
      setter(v);
      setVisible(PAGE_SIZE);
      syncUrl({ [key]: v });
    };

  const filtered = useMemo(() => {
    const needle = deferredQ.trim().toLowerCase();
    const res = alumni.filter((a) => {
      if (year && String(a.graduationYear) !== year) return false;
      if (dept && a.department !== dept) return false;
      if (prof && a.profession !== prof) return false;
      if (loc && a.city !== loc && a.country !== loc) return false;
      if (needle) {
        const hay = [a.fullName, a.designation, a.organisation, a.city, a.country, a.department, a.profession, String(a.graduationYear)]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    const by: Record<SortKey, (a: AlumniProfile, b: AlumniProfile) => number> = {
      az: (a, b) => a.fullName.localeCompare(b.fullName),
      za: (a, b) => b.fullName.localeCompare(a.fullName),
      recent: (a, b) => b.graduationYear - a.graduationYear || a.fullName.localeCompare(b.fullName),
      earliest: (a, b) => a.graduationYear - b.graduationYear || a.fullName.localeCompare(b.fullName),
    };
    return [...res].sort(by[sort]);
  }, [alumni, deferredQ, year, dept, prof, loc, sort]);

  const activeCount = [year, dept, prof, loc].filter(Boolean).length;
  const clearAll = () => {
    setQ("");
    setYear("");
    setDept("");
    setProf("");
    setLoc("");
    setSort("az");
    setVisible(PAGE_SIZE);
    startTransition(() => router.replace(pathname, { scroll: false }));
  };

  const shown = filtered.slice(0, visible);

  return (
    <div>
      {/* Toolbar */}
      <div className="sticky top-[4.5rem] z-20 -mx-5 border-b border-line bg-ivory/95 px-5 py-4 backdrop-blur-md sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:border-none lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <label htmlFor="alumni-search" className="sr-only">
              Search alumni
            </label>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              id="alumni-search"
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              onBlur={() => syncUrl({ q })}
              placeholder="Search by name, organisation, city or batch"
              className="h-12 w-full rounded-full border border-line bg-white pl-11 pr-4 text-[0.9375rem] text-ink placeholder:text-muted focus:border-gold-dark focus:outline-none focus:ring-4 focus:ring-gold/20"
            />
          </div>
          <Button
            variant="outline"
            className="h-12 lg:hidden"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            aria-controls="alumni-filters"
          >
            <SlidersHorizontal aria-hidden />
            <span className="sr-only sm:not-sr-only">Filters</span>
            {activeCount ? <span className="inline-flex size-5 items-center justify-center rounded-full bg-navy text-[0.65rem] text-ivory">{activeCount}</span> : null}
          </Button>
        </div>

        <div
          id="alumni-filters"
          className={cn(
            "grid gap-3 overflow-hidden transition-all duration-500 sm:grid-cols-2 lg:mt-5 lg:grid-cols-5 lg:!max-h-none lg:!opacity-100",
            filtersOpen ? "mt-4 max-h-[40rem] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <FilterSelect id="f-year" label="Graduation year" value={year} onChange={set(setYear, "year")} options={options.years} allLabel="All years" />
          <FilterSelect id="f-dept" label="Department" value={dept} onChange={set(setDept, "department")} options={options.depts} allLabel="All departments" />
          <FilterSelect id="f-prof" label="Profession" value={prof} onChange={set(setProf, "profession")} options={options.profs} allLabel="All professions" />
          <FilterSelect id="f-loc" label="Location" value={loc} onChange={set(setLoc, "location")} options={options.locs} allLabel="All locations" />
          <div>
            <label htmlFor="f-sort" className="mb-1.5 flex items-center gap-1.5 font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-strong">
              <ArrowDownAZ className="size-3" aria-hidden /> Sort
            </label>
            <div className="relative">
              <select
                id="f-sort"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as SortKey);
                  syncUrl({ sort: e.target.value });
                }}
                className={selectCls}
              >
                {(Object.keys(sortLabels) as SortKey[]).map((k) => (
                  <option key={k} value={k}>
                    {sortLabels[k]}
                  </option>
                ))}
              </select>
              <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted">
                <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Result summary */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <p className="text-sm text-muted-strong" aria-live="polite">
          Showing <strong className="font-semibold text-ink">{shown.length}</strong> of{" "}
          <strong className="font-semibold text-ink">{filtered.length}</strong> {filtered.length === 1 ? "alumnus" : "alumni"}
          {memberView ? " · member view" : ""}
        </p>
        {activeCount || q ? (
          <button type="button" onClick={clearAll} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-deep hover:underline">
            <X className="size-3.5" aria-hidden /> Clear all
          </button>
        ) : null}
      </div>

      {/* Grid */}
      {filtered.length ? (
        <ul className="mt-8 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence initial={false} mode="popLayout">
            {shown.map((a) => (
              <m.li
                key={a.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <AlumniCard alum={a} />
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <div className="mt-10 rounded-lg border border-dashed border-line bg-white/60 px-6 py-16 text-center">
          <p className="font-serif text-3xl text-navy">No alumni match these filters</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-strong">
            Try a broader search, or clear the filters. Members who chose a private profile do not appear in the directory.
          </p>
          <Button variant="outline" className="mt-6" onClick={clearAll}>
            Clear filters
          </Button>
        </div>
      )}

      {visible < filtered.length ? (
        <div className="mt-12 flex justify-center">
          <Button variant="navy" size="lg" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            Load more alumni
            <span className="text-ivory/60">({filtered.length - visible} remaining)</span>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
