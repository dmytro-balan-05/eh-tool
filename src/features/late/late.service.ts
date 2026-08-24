import { prisma } from "@/server/db";

export const EXCLUDED_CARRIERS = [
    "adp towing",
    "copart delivery",
    "dispatcher",
];
export function mondayOf(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0, 10);
}

function looksVin(t: string): boolean {
    return /^[A-HJ-NPR-Z0-9]{11,17}$/i.test(t) && /\d/.test(t) && /[A-Z]/i.test(t);
}

export function parseLateDeliveryPage(text: string): { vins: string[]; skipped: number } {
    const lines = text.split("\n");
    const blocks: string[] = [];
    let cur: string[] = [];

    for (const l of lines) {
        if (/^(MTL|GLI)-[A-Z]{2}\s*$/.test(l.trim())) {
            if (cur.length) blocks.push(cur.join("\n"));
            cur = [l];
        } else {
            cur.push(l);
        }
    }
    if (cur.length) blocks.push(cur.join("\n"));

    const vins: string[] = [];
    let skipped = 0;

    for (const b of blocks) {
        const vinLine = b.split("\n").map((x) => x.trim()).find((x) => looksVin(x));
        if (!vinLine) continue;
        const lower = b.toLowerCase();
        if (EXCLUDED_CARRIERS.some((e) => lower.includes(e))) {
            skipped++;
            continue;
        }
        const vin = vinLine.toUpperCase();
        if (!vins.includes(vin)) vins.push(vin);
    }

    return { vins, skipped };
}

export async function addLateDeliveries(userId: string, text: string) {
    const { vins, skipped } = parseLateDeliveryPage(text);
    const weekStart = mondayOf(new Date());

    if (vins.length === 0) return { added: 0, duplicates: 0, skipped };

    const existing = await prisma.lateDelivery.findMany({
        where: { userId, weekStart, vin: { in: vins } },
        select: { vin: true },
    });
    const existingSet = new Set(existing.map((e) => e.vin));
    const fresh = vins.filter((v) => !existingSet.has(v));

    if (fresh.length > 0) {
        await prisma.lateDelivery.createMany({
            data: fresh.map((vin) => ({ userId, vin, weekStart })),
            skipDuplicates: true,
        });
    }

    return { added: fresh.length, duplicates: vins.length - fresh.length, skipped };
}

export async function listLateDeliveries(userId: string, weekStart: string) {
    return prisma.lateDelivery.findMany({
        where: { userId, weekStart },
        orderBy: { createdAt: "desc" },
        select: { id: true, vin: true, createdAt: true },
    });
}

export async function countLateDeliveries(userId: string, weekStart: string) {
    return prisma.lateDelivery.count({ where: { userId, weekStart } });
}

export async function deleteLateDelivery(userId: string, id: string) {
    const existing = await prisma.lateDelivery.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existing) return false;
    await prisma.lateDelivery.delete({ where: { id } });
    return true;
}