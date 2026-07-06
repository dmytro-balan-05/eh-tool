import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/features/auth/auth";
import { changePassword, AuthError } from "@/features/auth/auth.service";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const currentPassword = String(body?.currentPassword || "");
    const newPassword = String(body?.newPassword || "");

    try {
        await changePassword(session.user.id, currentPassword, newPassword);
        return NextResponse.json({ ok: true });
    } catch (e) {
        if (e instanceof AuthError) {
            return NextResponse.json({ error: e.message }, { status: e.status });
        }
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}