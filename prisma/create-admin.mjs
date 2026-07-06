import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import readline from "node:readline/promises";

const prisma = new PrismaClient();
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const email = (await rl.question("Admin email: ")).toLowerCase().trim();
const password = await rl.question("Admin password: ");
rl.close();

const passwordHash = await bcrypt.hash(password, 12);
await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN", mustChangePassword: false },
    create: { email, passwordHash, role: "ADMIN", mustChangePassword: false },
});
console.log("Admin ready:", email);
await prisma.$disconnect();