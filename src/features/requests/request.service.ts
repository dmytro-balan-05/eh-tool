import { prisma } from "@/server/db";

export type RequestSource = "INTERNATIONAL" | "CUSTOMER_SERVICE";
export type RequestStatus = "NEW" | "CALLED_NO_ANSWER" | "RESOLVED";

export type CreateRequestInput = {
    vin?: string | null;
    text: string;
    source: RequestSource;
    tags?: string[];
};

export function listRequests(userId: string) {
    return prisma.request.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
}

export async function createRequests(userId: string, items: CreateRequestInput[]) {
    const clean = items
        .map((i) => ({
            userId,
            vin: i.vin?.trim().toUpperCase() || null,
            text: i.text.trim(),
            source: i.source,
            tags: i.tags ?? [],
        }))
        .filter((i) => i.text.length > 0);

    if (clean.length === 0) return { created: 0 };
    await prisma.request.createMany({ data: clean });
    return { created: clean.length };
}

export async function updateRequest(
    userId: string,
    id: string,
    data: { status?: RequestStatus; tags?: string[] },
) {
    const existing = await prisma.request.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existing) return null;
    return prisma.request.update({
        where: { id },
        data: { status: data.status, tags: data.tags },
    });
}

export async function deleteRequest(userId: string, id: string) {
    const existing = await prisma.request.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existing) return false;
    await prisma.request.delete({ where: { id } });
    return true;
}