import { prisma } from "@/server/db";

export type ReportSection = "DONE" | "PLAN" | "BLOCKERS";

export function listRoutines(userId: string) {
    return prisma.routine.findMany({
        where: { userId },
        orderBy: { sortOrder: "asc" },
    });
}

export async function addRoutine(
    userId: string,
    data: { text: string; sections?: ReportSection[] },
) {
    const count = await prisma.routine.count({ where: { userId } });
    const sections =
        data.sections && data.sections.length > 0 ? data.sections : (["PLAN"] as ReportSection[]);
    return prisma.routine.create({
        data: {
            userId,
            text: data.text.trim(),
            sections,
            sortOrder: count,
        },
    });
}

async function ownsRoutine(userId: string, id: string) {
    const r = await prisma.routine.findFirst({ where: { id, userId }, select: { id: true } });
    return !!r;
}

export async function updateRoutine(
    userId: string,
    id: string,
    data: { text?: string; sections?: ReportSection[]; active?: boolean },
) {
    if (!(await ownsRoutine(userId, id))) return null;
    return prisma.routine.update({
        where: { id },
        data: { text: data.text?.trim(), sections: data.sections, active: data.active },
    });
}

export async function deleteRoutine(userId: string, id: string) {
    if (!(await ownsRoutine(userId, id))) return false;
    await prisma.routine.delete({ where: { id } });
    return true;
}