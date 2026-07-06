import { prisma } from "@/server/db";

export type CreateWarehouseInput = {
    code?: string;
    city?: string;
    address?: string;
};

export class WarehouseError extends Error {
    constructor(message: string, public status: number) {
        super(message);
    }
}

export function listWarehouses() {
    return prisma.warehouse.findMany({ orderBy: { code: "asc" } });
}

export async function createWarehouse(input: CreateWarehouseInput) {
    const code = (input.code || "").trim();
    const city = (input.city || "").trim();
    const address = (input.address || "").trim();

    if (!code || !address) {
        throw new WarehouseError("Code and address are required", 400);
    }

    try {
        return await prisma.warehouse.create({
            data: { code, city: city || null, address },
        });
    } catch (e: unknown) {
        if ((e as { code?: string })?.code === "P2002") {
            throw new WarehouseError("That code already exists", 409);
        }
        throw new WarehouseError("Failed to create", 500);
    }
}

export async function deleteWarehouse(id: string) {
    if (!id) throw new WarehouseError("Missing id", 400);
    try {
        await prisma.warehouse.delete({ where: { id } });
    } catch {
        throw new WarehouseError("Failed to delete", 500);
    }
}