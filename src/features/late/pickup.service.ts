import { prisma } from "@/server/db";
import { mondayOf, EXCLUDED_CARRIERS } from "./late.service";
const LATE_AFTER_DAYS = 2;

function looksVin(t: string): boolean {
    return /^[A-HJ-NPR-Z0-9]{11,17}$/i.test(t) && /\d/.test(t) && /[A-Z]/i.test(t);
}

function splitOrders(text: string): string[] {
    const lines = text.split("\n");
    const idx: number[] = [];
    for (let i = 0; i < lines.length; i++) {
        const l = lines[i].trim();
        const next = (lines[i + 1] || "").trim();
        if (/^[A-Z0-9]{5}$/.test(l) && /^\d{2}\/\d{2}\/\d{2}\s/.test(next)) idx.push(i);
    }
    const blocks: string[] = [];
    for (let k = 0; k < idx.length; k++) {
        blocks.push(lines.slice(idx[k], idx[k + 1] ?? lines.length).join("\n"));
    }
    return blocks;
}

function assignedPickupDate(block: string, today: Date): Date | null {
    const m =
        block.match(/(\d{2})\/(\d{2})\s+(?:TBD|\d{2}\/\d{2})\s*\t/) ||
        block.match(/^(\d{2})\/(\d{2})\s+TBD/m);
    if (!m) return null;

    const mm = Number(m[1]);
    const dd = Number(m[2]);
    let year = today.getFullYear();
    let d = new Date(year, mm - 1, dd);

    if (d.getTime() - today.getTime() > 180 * 24 * 60 * 60 * 1000) {
        year -= 1;
        d = new Date(year, mm - 1, dd);
    }
    return d;
}

function daysSince(assigned: Date, today: Date): number {
    const a = new Date(assigned.getFullYear(), assigned.getMonth(), assigned.getDate());
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return Math.floor((t.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function parseLatePickupPage(text: string, today = new Date()) {
    const found: { vin: string; assignedDate: string }[] = [];
    let skippedCarrier = 0;
    let notLateYet = 0;

    for (const block of splitOrders(text)) {
        const vin = block.split("\n").map((x) => x.trim()).find(looksVin);
        if (!vin) continue;

        const lower = block.toLowerCase();
        if (EXCLUDED_CARRIERS.some((e) => lower.includes(e))) {
            skippedCarrier++;
            continue;
        }

        const assigned = assignedPickupDate(block, today);
        if (!assigned) continue;

        if (daysSince(assigned, today) < LATE_AFTER_DAYS) {
            notLateYet++;
            continue;
        }

        const iso = assigned.toISOString().slice(0, 10);
        if (!found.some((f) => f.vin === vin.toUpperCase())) {
            found.push({ vin: vin.toUpperCase(), assignedDate: iso });
        }
    }

    return { found, skippedCarrier, notLateYet };
}

export async function addLatePickups(userId: string, text: string) {
    const { found, skippedCarrier, notLateYet } = parseLatePickupPage(text);
    const weekStart = mondayOf(new Date());

    if (found.length === 0) {
        return { added: 0, duplicates: 0, skippedCarrier, notLateYet };
    }

    const vins = found.map((f) => f.vin);
    const existing = await prisma.latePickup.findMany({
        where: { userId, weekStart, vin: { in: vins } },
        select: { vin: true },
    });
    const existingSet = new Set(existing.map((e) => e.vin));
    const fresh = found.filter((f) => !existingSet.has(f.vin));

    if (fresh.length > 0) {
        await prisma.latePickup.createMany({
            data: fresh.map((f) => ({ userId, vin: f.vin, weekStart, assignedDate: f.assignedDate })),
            skipDuplicates: true,
        });
    }

    return {
        added: fresh.length,
        duplicates: found.length - fresh.length,
        skippedCarrier,
        notLateYet,
    };
}

export function listLatePickups(userId: string, weekStart: string) {
    return prisma.latePickup.findMany({
        where: { userId, weekStart },
        orderBy: { assignedDate: "asc" },
        select: { id: true, vin: true, assignedDate: true, createdAt: true },
    });
}

export function countLatePickups(userId: string, weekStart: string) {
    return prisma.latePickup.count({ where: { userId, weekStart } });
}

export async function deleteLatePickup(userId: string, id: string) {
    const existing = await prisma.latePickup.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existing) return false;
    await prisma.latePickup.delete({ where: { id } });
    return true;
}