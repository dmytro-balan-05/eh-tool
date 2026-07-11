import { prisma } from "@/server/db";
import { getRequestStats } from "@/features/requests/request.service";

export type ReportSection = "DONE" | "PLAN" | "BLOCKERS";

export async function getOrCreateReport(userId: string, date: string) {
    const existing = await prisma.report.findUnique({
        where: { userId_date: { userId, date } },
        include: { blocks: { orderBy: [{ section: "asc" }, { sortOrder: "asc" }] } },
    });
    if (existing) return existing;

    return prisma.report.create({
        data: { userId, date },
        include: { blocks: true },
    });
}

export async function addBlock(
    userId: string,
    date: string,
    data: { section: ReportSection; text: string; vin?: string | null },
) {
    const report = await getOrCreateReport(userId, date);
    const count = await prisma.reportBlock.count({
        where: { reportId: report.id, section: data.section },
    });
    return prisma.reportBlock.create({
        data: {
            reportId: report.id,
            section: data.section,
            text: data.text.trim(),
            vin: data.vin?.trim().toUpperCase() || null,
            kind: "MANUAL",
            sortOrder: count,
        },
    });
}

async function ownsBlock(userId: string, blockId: string) {
    const block = await prisma.reportBlock.findUnique({
        where: { id: blockId },
        select: { id: true, report: { select: { userId: true } } },
    });
    return block && block.report.userId === userId ? block : null;
}

export async function updateBlock(
    userId: string,
    blockId: string,
    data: { text?: string; section?: ReportSection; sortOrder?: number },
) {
    if (!(await ownsBlock(userId, blockId))) return null;
    return prisma.reportBlock.update({
        where: { id: blockId },
        data: {
            text: data.text?.trim(),
            section: data.section,
            sortOrder: data.sortOrder,
        },
    });
}

export async function deleteBlock(userId: string, blockId: string) {
    if (!(await ownsBlock(userId, blockId))) return false;
    await prisma.reportBlock.delete({ where: { id: blockId } });
    return true;
}

function dayBounds(date: string) {
    const from = new Date(`${date}T00:00:00`);
    const to = new Date(from);
    to.setDate(to.getDate() + 1);
    return { from, to };
}

function prevDate(date: string) {
    const d = new Date(`${date}T00:00:00`);
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
}

export async function assembleDraft(userId: string, date: string) {
    const report = await getOrCreateReport(userId, date);

    await prisma.reportBlock.deleteMany({
        where: { reportId: report.id, kind: { in: ["AUTO", "ROUTINE"] } },
    });

    const yesterday = prevDate(date);
    const { from: yFrom, to: yTo } = dayBounds(yesterday);

    const offers = await prisma.offer.findMany({
        where: { userId, createdAt: { gte: yFrom, lt: yTo } },
        select: { vin: true },
    });

    const stats = await getRequestStats(userId, yFrom, yTo);

    const routines = await prisma.routine.findMany({
        where: { userId, active: true },
        orderBy: { sortOrder: "asc" },
    });

    const auto: { section: ReportSection; kind: "AUTO" | "ROUTINE"; text: string; sortOrder: number }[] = [];

    if (offers.length > 0) {
        auto.push({
            section: "DONE",
            kind: "AUTO",
            text: `Offered ${offers.length} vehicle${offers.length === 1 ? "" : "s"}: ${offers.map((o) => o.vin).join(", ")}`,
            sortOrder: 0,
        });
    }

    const reqLine: string[] = [];
    if (stats.international.handled > 0)
        reqLine.push(`Int: ${stats.international.handled} (Solved ${stats.international.solved})`);
    if (stats.customerService.handled > 0)
        reqLine.push(`CS: ${stats.customerService.handled} (Solved ${stats.customerService.solved})`);
    if (reqLine.length > 0) {
        auto.push({ section: "DONE", kind: "AUTO", text: `Requests — ${reqLine.join(", ")}`, sortOrder: 1 });
    }

    routines.forEach((r, i) => {
        auto.push({ section: r.section as ReportSection, kind: "ROUTINE", text: r.text, sortOrder: 100 + i });
    });

    if (auto.length > 0) {
        await prisma.reportBlock.createMany({
            data: auto.map((a) => ({
                reportId: report.id,
                section: a.section,
                kind: a.kind,
                text: a.text,
                sortOrder: a.sortOrder,
            })),
        });
    }

    return getOrCreateReport(userId, date);
}