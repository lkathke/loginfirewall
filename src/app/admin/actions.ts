"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// --- User Actions ---

export async function getUsers() {
    const session = await getServerSession(authOptions) as Session | null;
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    return prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, username: true, displayName: true, role: true, totpEnabled: true, createdAt: true }
    });
}

export async function createUser(formData: FormData) {
    const session = await getServerSession(authOptions) as Session | null;
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    if (!username || !password) return { error: "Missing fields" };

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: role || "USER",
            },
        });
        revalidatePath("/admin/users");
        return { success: true };
    } catch {
        return { error: "User already exists or error creating user" };
    }
}

export async function deleteUser(userId: string) {
    const session = await getServerSession(authOptions) as Session | null;
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/admin/users");
    return { success: true };
}

export async function updateUser(formData: FormData) {
    const session = await getServerSession(authOptions) as Session | null;
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    const userId = formData.get("userId") as string;
    const displayName = formData.get("displayName") as string;
    const role = formData.get("role") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!userId) return { error: "User ID required" };

    const updateData: { displayName?: string | null; role?: string; password?: string } = {};

    // displayName can be empty string to clear it
    if (displayName !== null && displayName !== undefined) {
        updateData.displayName = displayName.trim() || null;
    }

    if (role) {
        updateData.role = role;
    }

    if (newPassword && newPassword.length >= 6) {
        updateData.password = await bcrypt.hash(newPassword, 10);
    } else if (newPassword && newPassword.length > 0 && newPassword.length < 6) {
        return { error: "Password must be at least 6 characters" };
    }

    await prisma.user.update({
        where: { id: userId },
        data: updateData,
    });

    revalidatePath("/admin/users");
    return { success: true };
}

export async function resetUserTotp(userId: string) {
    const session = await getServerSession(authOptions) as Session | null;
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    await prisma.user.update({
        where: { id: userId },
        data: {
            totpEnabled: false,
            totpSecret: null,
        },
    });

    revalidatePath("/admin/users");
    return { success: true };
}

// --- Group Actions ---

export async function getGroups() {
    const session = await getServerSession(authOptions) as Session | null;
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    return prisma.group.findMany({
        include: { links: true },
        orderBy: { createdAt: 'desc' }
    });
}

export async function createGroup(formData: FormData) {
    const session = await getServerSession(authOptions) as Session | null;
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const whitelistId = formData.get("whitelistId") as string;

    if (!name) return { error: "Group name is required" };

    await prisma.group.create({
        data: { name, whitelistId: whitelistId || null },
    });
    revalidatePath("/admin/groups");
    return { success: true };
}

export async function deleteGroup(groupId: string) {
    const session = await getServerSession(authOptions) as Session | null;
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    await prisma.group.delete({ where: { id: groupId } });
    revalidatePath("/admin/groups");
    return { success: true };
}

export async function updateGroup(groupId: string, name: string) {
    const session = await getServerSession(authOptions) as Session | null;
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    if (!name.trim()) return { error: "Name cannot be empty" };

    await prisma.group.update({
        where: { id: groupId },
        data: { name: name.trim() },
    });
    revalidatePath("/admin/groups");
    revalidatePath(`/admin/groups/${groupId}`);
    return { success: true };
}
