"use server";

import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updatePassword(formData: FormData) {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: "All fields are required" };
    }

    if (newPassword !== confirmPassword) {
        return { error: "New passwords do not match" };
    }

    if (newPassword.length < 6) {
        return { error: "Password must be at least 6 characters" };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) {
        return { error: "User not found" };
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
        return { error: "Incorrect current password" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashedPassword },
    });

    revalidatePath("/profile");
    return { success: true };
}
