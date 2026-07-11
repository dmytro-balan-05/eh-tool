"use client";
import { usePathname } from "next/navigation";
import { AppNav } from "./AppNav";

const HIDDEN = ["/login", "/change-password"];

export function NavGate() {
    const pathname = usePathname();
    if (HIDDEN.includes(pathname)) return null;
    return <AppNav />;
}