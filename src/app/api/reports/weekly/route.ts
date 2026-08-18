import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/features/auth/auth";
import { buildWeeklyReport, formatWeeklyReport } from "@/features/reports/weekly.service";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const reference = req.nextUrl.searchParams.get("date") || new Date().toISOString().slice(0, 10);
    const data = await buildWeeklyReport(session.user.id, reference);
    return NextResponse.json({ ...data, text: formatWeeklyReport(data) });
}

export const dynamic = "force-dynamic";