import { prisma } from "@/server/db";

export type SaveOfferInput = {
    vin: string;
    make?: string;
    model?: string;
    year?: string;
    price?: string;
    lotNumber?: string;
    pickupPlace?: string;
    deliveryPlace?: string;
};

export async function saveOffer(userId: string, input: SaveOfferInput) {
    const vin = input.vin.trim().toUpperCase();
    if (!vin) return { saved: false as const, reason: "empty" };

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existing = await prisma.offer.findFirst({
        where: { userId, vin, createdAt: { gte: startOfDay } },
        select: { id: true },
    });
    if (existing) return { saved: false as const, reason: "duplicate" };

    await prisma.offer.create({
        data: {
            userId,
            vin,
            make: input.make || null,
            model: input.model || null,
            year: input.year || null,
            price: input.price || "",
            lotNumber: input.lotNumber || null,
            pickupPlace: input.pickupPlace || null,
            deliveryPlace: input.deliveryPlace || null,
        },
    });
    return { saved: true as const };
}

export async function listMyOffers(userId: string) {
    return prisma.offer.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
            id: true, vin: true, make: true, model: true, year: true,
            price: true, lotNumber: true, createdAt: true,
        },
    });
}