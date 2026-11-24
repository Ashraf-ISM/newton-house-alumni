import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AchievementForm } from "@/components/admin/achievement-form";
import { AdminHeader, Panel } from "@/components/admin/admin-ui";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "New achievement" };

export default function NewAchievementPage() {
  return (
    <>
      <AdminHeader title="New achievement profile" actions={<Link href="/admin/achievements" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}><ArrowLeft aria-hidden /> All profiles</Link>} />
      <Panel className="max-w-4xl">
        <div className="p-6 sm:p-8">
          <AchievementForm />
        </div>
      </Panel>
    </>
  );
}
