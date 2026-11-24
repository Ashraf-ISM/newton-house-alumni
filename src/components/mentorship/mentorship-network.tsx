"use client";

import {
  Building2,
  CheckCircle2,
  Clock,
  GraduationCap,
  Handshake,
  Lock,
  MapPin,
  MessageSquare,
  RotateCcw,
  Search,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { registerAsMentorAction, requestMentorshipAction } from "@/app/actions/community";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { SubmitButton } from "@/components/ui/submit-button";
import { professions } from "@/data/alumni";
import { availabilityOptions, communicationMethods, mentorCategories } from "@/data/community";
import { useFormAction } from "@/hooks/use-form-action";
import { cn, initials } from "@/lib/utils";
import type { AlumniRecord, MentorCategorySlug, MentorProfile } from "@/types";

const selectCls =
  "h-11 w-full appearance-none rounded-md border border-line bg-white pl-3.5 pr-8 text-sm text-ink transition-colors focus:border-gold-dark focus:outline-none focus:ring-4 focus:ring-gold/20";

export function MentorshipNetworkClient({
  mentors,
  isVerifiedUser,
  viewerAlumni,
}: {
  mentors: MentorProfile[];
  isVerifiedUser: boolean;
  viewerAlumni: AlumniRecord | null;
}) {
  const [category, setCategory] = useState<string>("all");
  const [industry, setIndustry] = useState("");
  const [expertise, setExpertise] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [minExp, setMinExp] = useState("");
  const [location, setLocation] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);

  const options = useMemo(() => {
    const industries = [...new Set(mentors.map((m) => m.industry).filter(Boolean))].sort();
    const orgs = [...new Set(mentors.map((m) => m.organisation).filter(Boolean))].sort();
    const cities = [...new Set(mentors.map((m) => m.city).filter(Boolean))].sort();
    const expertises = [...new Set(mentors.flatMap((m) => m.expertise))].sort();
    return { industries, orgs, cities, expertises };
  }, [mentors]);

  const filtered = useMemo(() => {
    return mentors.filter((m) => {
      if (category !== "all" && !m.categories.includes(category as MentorCategorySlug)) return false;
      if (industry && m.industry !== industry) return false;
      if (organisation && m.organisation !== organisation) return false;
      if (location && m.city !== location) return false;
      if (minExp && m.experienceYears < Number(minExp)) return false;
      if (expertise) {
        const needle = expertise.toLowerCase();
        const match =
          m.expertise.some((e) => e.toLowerCase().includes(needle)) ||
          m.name.toLowerCase().includes(needle) ||
          m.bio.toLowerCase().includes(needle);
        if (!match) return false;
      }
      return true;
    });
  }, [mentors, category, industry, organisation, location, minExp, expertise]);

  const hasFilters = Boolean(category !== "all" || industry || expertise || organisation || minExp || location);
  const reset = () => {
    setCategory("all");
    setIndustry("");
    setExpertise("");
    setOrganisation("");
    setMinExp("");
    setLocation("");
  };

  const catLabel = (slug: MentorCategorySlug) =>
    mentorCategories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <div className="space-y-16">
      {/* B. 10 MENTOR CATEGORIES PILLS */}
      <div className="rounded-lg border border-line bg-card p-5 shadow-soft sm:p-6">
        <p className="font-label text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold-deep">
          Mentorship Domains (10 Categories)
        </p>
        <div
          role="group"
          aria-label="Filter mentors by category"
          className="no-scrollbar -mx-1 mt-3 flex items-center gap-2 overflow-x-auto px-1 py-1 sm:flex-wrap"
        >
          {[{ slug: "all", name: "All Mentors" }, ...mentorCategories].map((c) => {
            const active = category === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(c.slug)}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors",
                  active
                    ? "border-gold-dark bg-gold text-navy"
                    : "border-line bg-ivory/60 text-muted-strong hover:border-gold-dark hover:text-navy",
                )}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* D. FIND A MENTOR — 6 Filters */}
        <div className="mt-6 grid gap-3 border-t border-line pt-5 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label
              htmlFor="mf-exp-q"
              className="mb-1 block font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-strong"
            >
              Expertise or Keyword
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
              <input
                id="mf-exp-q"
                type="search"
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                placeholder="e.g. PhD, UPSC, Software…"
                className="h-11 w-full rounded-md border border-line bg-white pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-gold-dark focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="mf-ind"
              className="mb-1 block font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-strong"
            >
              Industry
            </label>
            <select
              id="mf-ind"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className={selectCls}
            >
              <option value="">All industries</option>
              {options.industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="mf-org"
              className="mb-1 block font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-strong"
            >
              Organisation
            </label>
            <select
              id="mf-org"
              value={organisation}
              onChange={(e) => setOrganisation(e.target.value)}
              className={selectCls}
            >
              <option value="">All organisations</option>
              {options.orgs.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="mf-years"
              className="mb-1 block font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-strong"
            >
              Experience
            </label>
            <select
              id="mf-years"
              value={minExp}
              onChange={(e) => setMinExp(e.target.value)}
              className={selectCls}
            >
              <option value="">Any experience</option>
              <option value="5">5+ years</option>
              <option value="8">8+ years</option>
              <option value="10">10+ years</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="mf-loc"
              className="mb-1 block font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-strong"
            >
              Location
            </label>
            <select
              id="mf-loc"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={selectCls}
            >
              <option value="">All cities</option>
              {options.cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-3 text-xs text-muted-strong">
          <span aria-live="polite">
            Showing <strong className="font-semibold text-navy">{filtered.length}</strong> of{" "}
            <strong className="font-semibold text-navy">{mentors.length}</strong> approved mentors
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

      {/* Mentor Cards Grid */}
      {filtered.length > 0 ? (
        <m.ul layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((mentor, idx) => (
              <m.li
                key={mentor.id}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, delay: Math.min(idx * 0.04, 0.25) }}
              >
                <article className="group relative flex h-full flex-col justify-between bg-card p-6 shadow-soft ring-1 ring-line/85 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-lift sm:p-7">
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-navy via-gold to-transparent"
                  />
                  <div>
                    {/* Top Row: Avatar + Availability Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/45 bg-ivory font-serif text-lg font-semibold text-navy">
                        {mentor.photoUrl ? (
                          <Image
                            src={mentor.photoUrl}
                            alt={mentor.name}
                            fill
                            sizes="3.5rem"
                            className="object-cover"
                            unoptimized={mentor.photoUrl.startsWith("data:")}
                          />
                        ) : (
                          initials(mentor.name)
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant={
                            mentor.availability === "Open for Mentorship"
                              ? "success"
                              : mentor.availability === "Limited Availability"
                                ? "warning"
                                : "neutral"
                          }
                        >
                          {mentor.availability}
                        </Badge>
                        {mentor.isSample ? <Badge variant="sample">Sample</Badge> : null}
                      </div>
                    </div>

                    {/* Name & Batch */}
                    <h3 className="mt-4 font-serif text-2xl leading-snug text-navy">{mentor.name}</h3>
                    <p className="mt-1 flex items-center gap-1.5 font-label text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-gold-deep">
                      <GraduationCap className="size-3.5 text-brick" aria-hidden />
                      {mentor.department} · Class of {mentor.graduationYear}
                    </p>

                    {/* Designation, Organisation & Experience */}
                    <div className="mt-3.5 space-y-1 border-l-2 border-gold/55 pl-3 text-xs">
                      <p className="font-semibold text-ink">{mentor.designation}</p>
                      <p className="flex items-center gap-1.5 text-muted-strong">
                        <Building2 className="size-3.5 text-gold-dark" aria-hidden /> {mentor.organisation}
                      </p>
                      <p className="flex items-center gap-3 text-muted-strong">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3.5 text-gold-dark" aria-hidden /> {mentor.experienceYears} yrs exp.
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5 text-gold-dark" aria-hidden /> {mentor.city}
                        </span>
                      </p>
                    </div>

                    <p className="mt-4 line-clamp-3 text-xs leading-relaxed text-muted-strong">{mentor.bio}</p>

                    {/* Expertise Tags */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {mentor.expertise.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-ivory px-2.5 py-1 text-[0.7rem] font-medium text-navy ring-1 ring-line"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-6 flex items-center justify-between border-t border-line/70 pt-4">
                    <span className="text-[0.7rem] text-muted-strong">
                      Prefers: <strong>{mentor.preferredCommunication}</strong>
                    </span>
                    <Button
                      size="sm"
                      variant="navy"
                      disabled={mentor.availability === "Currently Unavailable"}
                      onClick={() => setSelectedMentor(mentor)}
                    >
                      <MessageSquare className="size-3.5" aria-hidden /> Request Mentorship
                    </Button>
                  </div>
                </article>
              </m.li>
            ))}
          </AnimatePresence>
        </m.ul>
      ) : (
        <div className="rounded-lg border border-dashed border-line bg-card p-14 text-center">
          <Handshake className="mx-auto size-8 text-gold-dark" aria-hidden />
          <p className="mt-3 font-serif text-3xl text-navy">No mentors match these criteria</p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-deep hover:underline"
          >
            <RotateCcw className="size-3.5" aria-hidden /> Show all mentors
          </button>
        </div>
      )}

      {/* E. REQUEST MENTORSHIP MODAL */}
      <AnimatePresence>
        {selectedMentor ? (
          <RequestMentorshipModal
            mentor={selectedMentor}
            isVerifiedUser={isVerifiedUser}
            onClose={() => setSelectedMentor(null)}
            catLabel={catLabel}
          />
        ) : null}
      </AnimatePresence>

      {/* C. BECOME A MENTOR REGISTRATION SECTION */}
      <div id="become-mentor" className="scroll-mt-24">
        <BecomeMentorSection isVerifiedUser={isVerifiedUser} viewerAlumni={viewerAlumni} />
      </div>
    </div>
  );
}

function RequestMentorshipModal({
  mentor,
  isVerifiedUser,
  onClose,
  catLabel,
}: {
  mentor: MentorProfile;
  isVerifiedUser: boolean;
  onClose: () => void;
  catLabel: (s: MentorCategorySlug) => string;
}) {
  const [state, onSubmit, pending] = useFormAction(requestMentorshipAction);
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <m.div
      role="dialog"
      aria-modal="true"
      aria-label={`Request mentorship from ${mentor.name}`}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-navy-ink/80 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <m.div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto bg-card p-6 shadow-lift ring-1 ring-line sm:p-8"
        initial={{ scale: 0.96, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 12 }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
          <div>
            <p className="eyebrow text-gold-deep">Mentorship Request</p>
            <h3 className="mt-1 font-serif text-2xl text-navy">{mentor.name}</h3>
            <p className="text-xs text-muted-strong">
              {mentor.designation} · {mentor.organisation}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="inline-flex size-9 items-center justify-center rounded-full text-muted hover:bg-ivory hover:text-navy"
          >
            <X className="size-5" />
          </button>
        </div>

        {!isVerifiedUser ? (
          <div className="py-8 text-center">
            <Lock className="mx-auto size-7 text-gold-dark" aria-hidden />
            <h4 className="mt-3 font-serif text-2xl text-navy">Verified Alumni Access Required</h4>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-strong">
              To protect mentor privacy, only signed-in, verified Newton House members can send mentorship requests.
            </p>
            <Link
              href="/login?next=/mentorship"
              className={cn(buttonVariants({ variant: "navy", size: "md" }), "mt-6")}
            >
              Sign In to Request Mentorship
            </Link>
          </div>
        ) : state?.ok ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto size-8 text-[#22553a]" aria-hidden />
            <h4 className="mt-3 font-serif text-2xl text-navy">Mentorship Request Sent</h4>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-strong">{state.message}</p>
            <Button variant="navy" className="mt-6" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-5 space-y-4">
            <input type="hidden" name="mentorId" value={mentor.id} />
            <input type="hidden" name="mentorName" value={mentor.name} />

            <FormStatus state={state} />

            <Field id="mr-title" label="Request title" required error={fe?.title}>
              {(a) => <Input {...a} name="title" placeholder="e.g. Guidance on Doctoral Fellowship Applications" />}
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="mr-area" label="Area of guidance" required error={fe?.areaOfGuidance}>
                {(a) => (
                  <Select {...a} name="areaOfGuidance" defaultValue={catLabel(mentor.categories[0])}>
                    {mentor.categories.map((c) => (
                      <option key={c} value={catLabel(c)}>
                        {catLabel(c)}
                      </option>
                    ))}
                    {mentor.expertise.map((ex) => (
                      <option key={ex} value={ex}>
                        {ex}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>

              <Field id="mr-comm" label="Preferred communication method" required>
                {(a) => (
                  <Select {...a} name="preferredCommunication" defaultValue={mentor.preferredCommunication}>
                    {communicationMethods.map((cm) => (
                      <option key={cm} value={cm}>
                        {cm}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>

            <Field id="mr-intro" label="Short introduction" required error={fe?.introduction}>
              {(a) => (
                <Textarea
                  {...a}
                  name="introduction"
                  rows={2}
                  className="min-h-20"
                  placeholder="Your batch, department and current academic or career stage…"
                />
              )}
            </Field>

            <Field id="mr-question" label="Specific question or goal" required error={fe?.question}>
              {(a) => (
                <Textarea
                  {...a}
                  name="question"
                  rows={3}
                  placeholder="What specific advice or feedback are you hoping to discuss?"
                />
              )}
            </Field>

            <p className="flex items-center gap-1.5 text-xs text-muted-strong">
              <ShieldCheck className="size-4 shrink-0 text-gold-dark" aria-hidden />
              <span>
                Privacy policy: Personal phone numbers and private emails are never exposed by default.
              </span>
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <SubmitButton pending={pending} variant="navy" pendingLabel="Sending request…">
                Send Mentorship Request
              </SubmitButton>
            </div>
          </form>
        )}
      </m.div>
    </m.div>
  );
}

function BecomeMentorSection({
  isVerifiedUser,
  viewerAlumni,
}: {
  isVerifiedUser: boolean;
  viewerAlumni: AlumniRecord | null;
}) {
  const [state, onSubmit, pending] = useFormAction(registerAsMentorAction);
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  if (!isVerifiedUser) {
    return (
      <div className="rounded-lg border border-dashed border-gold-dark/45 bg-card p-8 text-center sm:p-12">
        <Lock className="mx-auto size-7 text-gold-dark" aria-hidden />
        <h3 className="mt-3 font-serif text-3xl text-navy">Become a Newton House Mentor</h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-strong">
          Verified Newton House alumni can register as mentors to guide current students and younger cohorts. Sign in to
          your approved account to volunteer.
        </p>
        <Link
          href="/login?next=/mentorship#become-mentor"
          className={cn(buttonVariants({ variant: "navy", size: "lg" }), "mt-6")}
        >
          Sign In to Register as a Mentor
        </Link>
      </div>
    );
  }

  if (state?.ok) {
    return (
      <div className="rounded-lg border border-[#bcd8c4] bg-[#eef6f0] p-8 text-center text-[#1f4d33] sm:p-12">
        <CheckCircle2 className="mx-auto size-8" aria-hidden />
        <h3 className="mt-3 font-serif text-3xl">Mentor Application Submitted for Approval</h3>
        <p className="mx-auto mt-2 max-w-lg text-sm">{state.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 shadow-lift ring-1 ring-line sm:p-10">
      <div className="max-w-2xl">
        <p className="eyebrow text-gold-deep">Give Back to the House</p>
        <h3 className="mt-2 font-serif text-3xl text-navy">Become a Mentor</h3>
        <p className="mt-1.5 text-sm text-muted-strong">
          Share your professional experience with younger Newton House generations. All mentor profiles are reviewed by
          administrators before appearing in the public directory.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-6">
        <FormStatus state={state} />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field id="bm-desig" label="Professional designation" required error={fe?.designation}>
            {(a) => <Input {...a} name="designation" defaultValue={viewerAlumni?.designation ?? ""} />}
          </Field>
          <Field id="bm-org" label="Organisation" required error={fe?.organisation}>
            {(a) => <Input {...a} name="organisation" defaultValue={viewerAlumni?.organisation ?? ""} />}
          </Field>
          <Field id="bm-exp" label="Experience (years)" required error={fe?.experienceYears}>
            {(a) => <Input {...a} name="experienceYears" inputMode="numeric" placeholder="e.g. 8" />}
          </Field>
          <Field id="bm-city" label="Current city" required>
            {(a) => <Input {...a} name="city" defaultValue={viewerAlumni?.city ?? "Patna"} />}
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field id="bm-ind" label="Industry / Field" required>
            {(a) => (
              <Select {...a} name="industry" defaultValue={viewerAlumni?.profession ?? "Academia & Research"}>
                {professions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field id="bm-comm" label="Preferred communication method" required>
            {(a) => (
              <Select {...a} name="preferredCommunication" defaultValue="Platform Message">
                {communicationMethods.map((cm) => (
                  <option key={cm} value={cm}>
                    {cm}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field id="bm-avail" label="Availability" required>
            {(a) => (
              <Select {...a} name="availability" defaultValue="Open for Mentorship">
                {availabilityOptions.map((av) => (
                  <option key={av} value={av}>
                    {av}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>

        <Field
          id="bm-expertise"
          label="Areas of expertise (comma-separated)"
          required
          error={fe?.expertise}
          hint="e.g. PhD Admissions, UPSC Interview Prep, System Design, Hydrogeology"
        >
          {(a) => <Input {...a} name="expertise" placeholder="PhD Admissions, Research Fellowships, Academic Writing" />}
        </Field>

        <fieldset>
          <legend className="mb-2.5 text-[0.8125rem] font-semibold text-ink">
            Mentorship categories (select one or more) <span className="text-brick">*</span>
          </legend>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {mentorCategories.map((c, i) => (
              <label
                key={c.slug}
                className="flex cursor-pointer items-center gap-2.5 rounded border border-line bg-ivory/40 px-3.5 py-2.5 text-xs font-medium text-ink has-[:checked]:border-gold-dark has-[:checked]:bg-gold/10"
              >
                <input
                  type="checkbox"
                  name="categories"
                  value={c.slug}
                  defaultChecked={i === 0}
                  className="accent-[#0b1f38]"
                />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
          {fe?.categories ? <p className="mt-1.5 text-xs font-medium text-brick">{fe.categories[0]}</p> : null}
        </fieldset>

        <Field id="bm-bio" label="Short mentorship introduction" required error={fe?.bio}>
          {(a) => (
            <Textarea
              {...a}
              name="bio"
              rows={4}
              placeholder="Describe how you can help students and fellow Newton House alumni…"
            />
          )}
        </Field>

        <SubmitButton pending={pending} variant="navy" size="lg" pendingLabel="Submitting mentor profile…">
          <UserPlus aria-hidden /> Submit Mentor Registration
        </SubmitButton>
      </form>
    </div>
  );
}
