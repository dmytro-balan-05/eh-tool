import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";

export class AuthError extends Error {
    constructor(message: string, public status: number) {
        super(message);
    }
}

export async function changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
) {
    if (!newPassword || newPassword.length < 8) {
        throw new AuthError("New password must be at least 8 characters", 400);
    }
    if (newPassword === currentPassword) {
        throw new AuthError("New password must differ from the current one", 400);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
        throw new AuthError("User not found", 404);
    }

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
        throw new AuthError("Current password is incorrect", 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
        where: { id: userId },
        data: { passwordHash, mustChangePassword: false },
    });
}
export async function createUser(email: string, tempPassword: string) {
    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
        throw new AuthError("Valid email is required", 400);
    }
    if (!tempPassword || tempPassword.length < 8) {
        throw new AuthError("Temporary password must be at least 8 characters", 400);
    }

    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
        throw new AuthError("User with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(tempPassword, 12);
    const user = await prisma.user.create({
        data: {
            email: cleanEmail,
            passwordHash,
            role: "USER",
            mustChangePassword: true,
        },
        select: { id: true, email: true },
    });
    return user;
}
export async function listUsers() {
    return prisma.user.findMany({
        select: { id: true, email: true, role: true, mustChangePassword: true, createdAt: true },
        orderBy: { createdAt: "asc" },
    });
}

export async function deleteUser(id: string, currentUserId: string) {
    if (!id) throw new AuthError("Missing id", 400);
    if (id === currentUserId) {
        throw new AuthError("You cannot delete your own account", 400);
    }
    try {
        await prisma.user.delete({ where: { id } });
    } catch {
        throw new AuthError("Failed to delete user", 500);
    }
}