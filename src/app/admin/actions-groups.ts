"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getGroup(id: string) {
    const session = await getServerSession(authOptions) as Session | null;
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    return prisma.group.findUnique({
        where: { id },
        include: {
            links: true,
            users: {
                include: {
                    user: true,
                },
            },
        },
    });
}

export async function addLink(formData: FormData) {
    const session = await getServerSession(authOptions) as Session | null;
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    const title = formData.get("title") as string;
    const url = formData.get("url") as string;
    const icon = formData.get("icon") as string;
    const groupId = formData.get("groupId") as string;

    if (!title || !url || !groupId) return { error: "Missing fields" };

    await prisma.link.create({
        data: { title, url, icon: icon || "Link", groupId },
    });
    revalidatePath(`/admin/groups/${groupId}`);
    return { success: true };
}

export async function deleteLink(linkId: string, groupId: string) {
    const session = await getServerSession(authOptions) as Session | null;
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    await prisma.link.delete({ where: { id: linkId } });
    revalidatePath(`/admin/groups/${groupId}`);
    return { success: true };
}

export async function updateLink(formData: FormData) {
    const session = await getServerSession(authOptions) as Session | null;
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    const linkId = formData.get("linkId") as string;
    const title = formData.get("title") as string;
    const url = formData.get("url") as string;
    const icon = formData.get("icon") as string;
    const groupId = formData.get("groupId") as string;

    if (!linkId || !title || !url || !groupId) return { error: "Missing fields" };

    await prisma.link.update({
        where: { id: linkId },
        data: { title, url, icon: icon || "Link" },
    });
    revalidatePath(`/admin/groups/${groupId}`);
    return { success: true };
}

export async function addUserToGroup(formData: FormData) {
    const session = await getServerSession(authOptions) as Session | null;
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    const username = formData.get("username") as string;
    const groupId = formData.get("groupId") as string;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return { error: "User not found" };

    try {
        await prisma.userGroup.create({
            data: {
                userId: user.id,
                groupId,
            },
        });
        revalidatePath(`/admin/groups/${groupId}`);
        return { success: true };
    } catch {
        return { error: "User already in group" };
    }
}

export async function removeUserFromGroup(userId: string, groupId: string) {
    const session = await getServerSession(authOptions) as Session | null;
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    await prisma.userGroup.delete({
        where: {
            userId_groupId: {
                userId,
                groupId,
            },
        },
    });
    revalidatePath(`/admin/groups/${groupId}`);
    return { success: true };
}
