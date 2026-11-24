import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AdminHeader, Panel } from "@/components/admin/admin-ui";
import { EventForm } from "@/components/admin/event-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "New event" };

export default function NewEventPage() {
  return (
    <>
      <AdminHeader title="New event" actions={<Link href="/admin/events" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}><ArrowLeft aria-hidden /> All events</Link>} />
      <Panel className="max-w-4xl">
        <div className="p-6 sm:p-8">
          <EventForm />
        </div>
      </Panel>
    </>
  );
}
