import { getViewer } from "@/lib/auth";
import { getEventById, listRegistrations } from "@/lib/data/events";
import { toCsv } from "@/lib/utils/csv";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const viewer = await getViewer();
  if (!viewer.role) return new Response("Forbidden", { status: 403 });
  const { id } = await params;
  const e = await getEventById(id);
  if (!e) return new Response("Not found", { status: 404 });
  const regs = await listRegistrations(id);
  const csv = toCsv(
    ["Name", "Email", "Graduation year", "Guests", "Note", "Registered at"],
    regs.map((r) => [r.fullName, r.email, r.graduationYear ?? "", r.guests, r.note ?? "", r.createdAt]),
  );
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${e.slug}-registrations.csv"` },
  });
}
