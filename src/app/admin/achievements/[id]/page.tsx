import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AchievementForm } from "@/components/admin/achievement-form";
import { AdminHeader, Panel } from "@/components/admin/admin-ui";
import { buttonVariants } from "@/components/ui/button";
import { listAchievements } from "@/lib/data/content";
import { cn } from "@/lib/utils";

export const metadata = { title: "Edit achievement" };

export default async function EditAchievementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = (await listAchievements({ includeUnpublished: true })).find((x) => x.id === id);
  if (!a) notFound();
  return (
    <>
      <AdminHeader title={a.name} actions={<Link href="/admin/achievements" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}><ArrowLeft aria-hidden /> All profiles</Link>} />
      <Panel className="max-w-4xl">
        <div className="p-6 sm:p-8">
          <AchievementForm achievement={a} />
        </div>
      </Panel>
    </>
  );
}
