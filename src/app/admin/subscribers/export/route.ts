import { getViewer } from "@/lib/auth";
import { listSubscribers } from "@/lib/data/inbox";
import { toCsv } from "@/lib/utils/csv";

export async function GET() {
  const viewer = await getViewer();
  if (!viewer.role) return new Response("Forbidden", { status: 403 });
  const subs = await listSubscribers();
  const csv = toCsv(["Email", "Subscribed at"], subs.map((s) => [s.email, s.createdAt]));
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="newton-house-subscribers.csv"' },
  });
}
