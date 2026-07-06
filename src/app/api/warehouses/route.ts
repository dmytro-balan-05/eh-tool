import { NextRequest, NextResponse } from "next/server";
import {
    listWarehouses,
    createWarehouse,
    deleteWarehouse,
    WarehouseError,
} from "@/features/warehouses/warehouse.service";

export async function GET() {
    const warehouses = await listWarehouses();
    return NextResponse.json(warehouses);
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    try {
        const warehouse = await createWarehouse(body ?? {});
        return NextResponse.json(warehouse, { status: 201 });
    } catch (e) {
        if (e instanceof WarehouseError) {
            return NextResponse.json({ error: e.message }, { status: e.status });
        }
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id") ?? "";
    try {
        await deleteWarehouse(id);
        return NextResponse.json({ ok: true });
    } catch (e) {
        if (e instanceof WarehouseError) {
            return NextResponse.json({ error: e.message }, { status: e.status });
        }
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}