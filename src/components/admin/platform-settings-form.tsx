"use client";

import { useActionState } from "react";
import { savePlatformSettingsAction } from "@/app/actions/community";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { ActionResult, SiteSettings } from "@/types";

export function PlatformSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    savePlatformSettingsAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-6">
      {state ? (
        <p
          role="alert"
          className={`rounded-md border px-4 py-3 text-sm ${
            state.ok
              ? "border-[#bfe0c9] bg-[#e3efe6] text-[#22553a]"
              : "border-[#e8c3b8] bg-[#fbefeb] text-[#7c3121]"
          }`}
        >
          {state.message}
        </p>
      ) : null}
      <div className="divide-y divide-line">
        <label className="flex items-start justify-between gap-4 py-4">
          <div>
            <p className="font-semibold text-ink">Require Administrator Approval for Alumni Registrations</p>
            <p className="text-xs text-muted-strong">
              New join applications enter the Pending Verification queue before appearing in the public directory.
            </p>
          </div>
          <input
            type="checkbox"
            name="requireRegistrationApproval"
            defaultChecked={settings.requireRegistrationApproval}
            className="mt-1 size-4 accent-navy"
          />
        </label>

        <label className="flex items-start justify-between gap-4 py-4">
          <div>
            <p className="font-semibold text-ink">Require Editorial Moderation for Alumni Stories</p>
            <p className="text-xs text-muted-strong">
              Member-submitted stories must be reviewed and published by an editor or administrator.
            </p>
          </div>
          <input
            type="checkbox"
            name="requireStoryModeration"
            defaultChecked={settings.requireStoryModeration}
            className="mt-1 size-4 accent-navy"
          />
        </label>

        <label className="flex items-start justify-between gap-4 py-4">
          <div>
            <p className="font-semibold text-ink">Require Archivist Approval for Heritage Archive Uploads</p>
            <p className="text-xs text-muted-strong">
              Uploaded historical photographs and PDF documents enter Pending Review before publication.
            </p>
          </div>
          <input
            type="checkbox"
            name="requireArchiveModeration"
            defaultChecked={settings.requireArchiveModeration}
            className="mt-1 size-4 accent-navy"
          />
        </label>

        <label className="flex items-start justify-between gap-4 py-4">
          <div>
            <p className="font-semibold text-ink">Require Approval for Mentor Profiles</p>
            <p className="text-xs text-muted-strong">
              Volunteer mentors are verified by the Mentorship Committee before appearing in the mentor directory.
            </p>
          </div>
          <input
            type="checkbox"
            name="requireMentorApproval"
            defaultChecked={settings.requireMentorApproval}
            className="mt-1 size-4 accent-navy"
          />
        </label>

        <label className="flex items-start justify-between gap-4 py-4">
          <div>
            <p className="font-semibold text-ink">Allow Member-to-Member Connection Requests</p>
            <p className="text-xs text-muted-strong">
              Verified alumni can send and accept connection requests through the Member Portal.
            </p>
          </div>
          <input
            type="checkbox"
            name="allowMemberConnections"
            defaultChecked={settings.allowMemberConnections}
            className="mt-1 size-4 accent-navy"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
        <p className="text-xs text-muted-strong">
          Last updated by <span className="font-medium text-ink">{settings.updatedBy}</span> on{" "}
          {formatDate(settings.updatedAt)}
        </p>
        <Button type="submit" variant="navy" disabled={pending}>
          {pending ? "Saving settings…" : "Save Platform Settings"}
        </Button>
      </div>
    </form>
  );
}
