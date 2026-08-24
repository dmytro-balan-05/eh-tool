import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/features/auth/auth";
import { getReportSettings, updateReportSettings } from "@/features/reports/settings.service";

async function userId() {
    const session = await auth();
    return session?.user?.id ?? null;
}

export async function GET() {
    const uid = await userId();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json(await getReportSettings(uid));
}

export async function PATCH(req: NextRequest) {
    const uid = await userId();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

    const allowed = ["reportOffers", "reportRequests", "reportLateDel", "reportLatePickups"] as const;
    const data: Record<string, boolean> = {};
    for (const key of allowed) {
        if (typeof body[key] === "boolean") data[key] = body[key];
    }
    if (Object.keys(data).length === 0) {
        return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }
    return NextResponse.json(await updateReportSettings(uid, data));
}

export const dynamic = "force-dynamic";