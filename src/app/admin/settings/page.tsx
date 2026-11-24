import Link from "next/link";
import { AdminHeader, Panel } from "@/components/admin/admin-ui";
import { PlatformSettingsForm } from "@/components/admin/platform-settings-form";
import { siteConfig } from "@/data/site";
import { getSiteSettings } from "@/lib/data/community";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata = { title: "Site Settings" };

export default function AdminSettingsPage() {
  const settings = getSiteSettings();
  const hasSupabase = isSupabaseConfigured();

  return (
    <>
      <AdminHeader
        title="Site Settings"
        description="Configure moderation requirements, privacy defaults, and institutional metadata for the Newton House platform."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Moderation & Privacy Governance" className="xl:col-span-2">
          <div className="p-6 sm:p-8">
            <PlatformSettingsForm settings={settings} />
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Institutional Identity">
            <dl className="space-y-3 p-6 text-sm">
              <div>
                <dt className="text-xs text-muted-strong">Institution</dt>
                <dd className="font-semibold text-ink">{siteConfig.name} — {siteConfig.institution}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-strong">Association</dt>
                <dd className="text-ink">{siteConfig.association}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-strong">Tagline</dt>
                <dd className="italic text-ink">{siteConfig.tagline}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-strong">Database Mode</dt>
                <dd className="text-ink">
                  {hasSupabase ? "Supabase + Local Hybrid Store" : "Local Hybrid Store"}
                </dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Platform Quick Links">
            <ul className="divide-y divide-line text-sm">
              <li className="px-6 py-3">
                <Link href="/member/dashboard" className="font-semibold text-gold-deep hover:underline">
                  Member Portal (/member/dashboard) →
                </Link>
              </li>
              <li className="px-6 py-3">
                <Link href="/alumni/batches" className="font-semibold text-gold-deep hover:underline">
                  Batch Directory (/alumni/batches) →
                </Link>
              </li>
              <li className="px-6 py-3">
                <Link href="/archive" className="font-semibold text-gold-deep hover:underline">
                  Digital Heritage Archive (/archive) →
                </Link>
              </li>
              <li className="px-6 py-3">
                <Link href="/alumni/stories" className="font-semibold text-gold-deep hover:underline">
                  Voices of Newton House (/alumni/stories) →
                </Link>
              </li>
              <li className="px-6 py-3">
                <Link href="/mentorship" className="font-semibold text-gold-deep hover:underline">
                  Mentorship Network (/mentorship) →
                </Link>
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
