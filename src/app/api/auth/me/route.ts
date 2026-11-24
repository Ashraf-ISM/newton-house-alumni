import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const v = await getViewer();
  const authenticated = Boolean(v.userId && (v.role || v.isApprovedMember));
  return NextResponse.json({
    authenticated,
    role: authenticated ? v.role : null,
    name: authenticated ? (v.alumni?.fullName.split(" ")[0] ?? "Admin") : null,
  });
}
