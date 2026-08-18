import { prisma } from "@/server/db";
import { getRequestStats } from "@/features/requests/request.service";
import { countLateDeliveries, mondayOf } from "@/features/late/late.service";

function toStr(d: Date) {
    return d.toISOString().slice(0, 10);
}

export function lastWeekRange(reference: string) {
    const thisMonday = new Date(`${mondayOf(new Date(`${reference}T00:00:00`))}T00:00:00`);

    const lastMonday = new Date(thisMonday);
    lastMonday.setDate(thisMonday.getDate() - 7);

    const lastFriday = new Date(lastMonday);
    lastFriday.setDate(lastMonday.getDate() + 4);

    const workdays: string[] = [];
    for (let i = 0; i < 5; i++) {
        const d = new Date(lastMonday);
        d.setDate(lastMonday.getDate() + i);
        workdays.push(toStr(d));
    }

    return {
        weekStart: toStr(lastMonday),
        from: new Date(`${toStr(lastMonday)}T00:00:00`),
        to: new Date(`${toStr(lastFriday)}T23:59:59`),
        workdays,
        label: `${toStr(lastMonday)} – ${toStr(lastFriday)}`,
    };
}

export async function buildWeeklyReport(userId: string, reference: string) {
    const range = lastWeekRange(reference);

    const offersCount = await prisma.offer.count({
        where: { userId, createdAt: { gte: range.from, lte: range.to } },
    });

    const requests = await getRequestStats(userId, range.from, range.to);
    const lateCount = await countLateDeliveries(userId, range.weekStart);

    const reports = await prisma.report.findMany({
        where: { userId, date: { in: range.workdays } },
        include: { blocks: true },
    });

    const blockers: string[] = [];
    for (const rep of reports) {
        for (const b of rep.blocks) {
            if (b.section === "BLOCKERS" && !blockers.includes(b.text)) blockers.push(b.text);
        }
    }

    return {
        label: range.label,
        offersCount,
        requests,
        lateCount,
        blockers,
    };
}

export function formatWeeklyReport(data: Awaited<ReturnType<typeof buildWeeklyReport>>): string {
    const lines: string[] = [];
    lines.push(`Weekly report (${data.label})`);
    lines.push("");
    lines.push(`Offers: ${data.offersCount}`);

    const req: string[] = [];
    req.push(`Int: ${data.requests.international.handled} (Solved ${data.requests.international.solved})`);
    req.push(`CS: ${data.requests.customerService.handled} (Solved ${data.requests.customerService.solved})`);
    lines.push(`Requests — ${req.join(", ")}`);
    lines.push(`Late deliveries: ${data.lateCount}`);
    lines.push("");
    lines.push("Blockers / Issues:");
    if (data.blockers.length === 0) lines.push("- —");
    else for (const b of data.blockers) lines.push(`- ${b}`);

    return lines.join("\n");
}