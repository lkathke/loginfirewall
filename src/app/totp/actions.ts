"use server";

import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildOtpauthUrl, buildQrDataUrl, generateTotpSecret, verifyTotpToken } from "@/lib/totp";
import { revalidatePath } from "next/cache";

async function requireUser() {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
        throw new Error("User not found");
    }
    return user;
}

export async function getTotpSetup() {
    const user = await requireUser();

    let secret = user.totpSecret;
    if (!secret) {
        secret = generateTotpSecret();
        await prisma.user.update({
            where: { id: user.id },
            data: { totpSecret: secret, totpEnabled: false },
        });
    }

    const otpauthUrl = buildOtpauthUrl(user.username, secret);
    const qrDataUrl = await buildQrDataUrl(otpauthUrl);

    return {
        enabled: user.totpEnabled,
        secret,
        otpauthUrl,
        qrDataUrl,
    };
}

export async function enableTotp(token: string) {
    const user = await requireUser();
    if (!user.totpSecret) {
        return { error: "No TOTP secret configured. Refresh and try again." };
    }

    const isValid = verifyTotpToken(token, user.totpSecret);
    if (!isValid) {
        return { error: "Invalid TOTP code" };
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { totpEnabled: true },
    });

    revalidatePath("/profile");
    revalidatePath("/admin");
    return { success: true };
}

export async function disableTotp() {
    const user = await requireUser();
    await prisma.user.update({
        where: { id: user.id },
        data: { totpEnabled: false, totpSecret: null },
    });
    revalidatePath("/profile");
    revalidatePath("/admin");
    return { success: true };
}
