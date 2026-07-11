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
    const existing = await prisma.request.findFirst({
        where: { id, userId },
        select: { id: true, source: true, status: true },
    });
    if (!existing) return null;

    const statusChanged = data.status && data.status !== existing.status;

    if (statusChanged && data.status !== "NEW") {
        const type =
            data.status === "RESOLVED"
                ? "RESOLVED"
                : "CALLED_NO_ANSWER";
        await prisma.requestAction.create({
            data: {
                requestId: id,
                userId,
                source: existing.source,
                type,
            },
        });
    }

    return prisma.request.update({
        where: { id },
        data: {
            status: data.status,
            tags: data.tags,
            resolvedAt:
                data.status === "RESOLVED"
                    ? new Date()
                    : data.status === "NEW"
                        ? null
                        : undefined,
        },
    });
}

export async function deleteRequest(userId: string, id: string) {
    const existing = await prisma.request.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existing) return false;
    await prisma.request.delete({ where: { id } });
    return true;
}
export type RequestDayStats = {
    international: { handled: number; solved: number };
    customerService: { handled: number; solved: number };
};

export async function getRequestStats(
    userId: string,
    from: Date,
    to: Date,
): Promise<RequestDayStats> {
    const actions = await prisma.requestAction.findMany({
        where: { userId, createdAt: { gte: from, lt: to } },
        select: { requestId: true, source: true, type: true },
    });

    const handledInt = new Set<string>();
    const solvedInt = new Set<string>();
    const handledCs = new Set<string>();
    const solvedCs = new Set<string>();

    for (const a of actions) {
        const isInt = a.source === "INTERNATIONAL";
        (isInt ? handledInt : handledCs).add(a.requestId);
        if (a.type === "RESOLVED") (isInt ? solvedInt : solvedCs).add(a.requestId);
    }

    return {
        international: { handled: handledInt.size, solved: solvedInt.size },
        customerService: { handled: handledCs.size, solved: solvedCs.size },
    };
}