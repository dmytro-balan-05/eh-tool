import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const warehouses = [
    { code: "MTL-NJ", city: "New York", address: "921 Delancy St, Newark, NJ 07105" },
    { code: "MTL-CA", city: "Stanton", address: "11121 Dale St, Stanton, CA 90680" },
    { code: "MTL-TX", city: "Houston", address: "501 N 16th Street, La Porte, TX 77571" },
    { code: "MTL-GA", city: "Savannah", address: "142 Commerce Drive, Rincon, GA 31326" },
    { code: "GLI-TX", city: "Houston", address: "1919 Gault Rd, Houston, TX 77039" },
];

for (const w of warehouses) {
    await prisma.warehouse.upsert({ where: { code: w.code }, update: {}, create: w });
}
console.log("Seeded", warehouses.length, "warehouses");
await prisma.$disconnect();