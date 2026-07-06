import { redirect } from "next/navigation";
import { auth } from "@/features/auth/auth";
import { CreateUserForm } from "@/features/auth/components/CreateUserForm";

export default async function AdminUsersPage() {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;

    if (role !== "ADMIN") {
        redirect("/");
    }

    return <CreateUserForm />;
}