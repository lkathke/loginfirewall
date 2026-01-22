"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { whitelistUserIP } from "@/lib/ip-whitelist";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ZoraxyService } from "@/lib/zoraxy";

export async function performIpWhitelist() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

    try {
        await whitelistUserIP(session.user.id, ip);
        return { success: true, ip };
    } catch (error) {
        console.error("Whitelisting failed:", error);
        return { success: false, error: "Failed to whitelist IP" };
    }
}

export async function revokeIpWhitelist() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Get all whitelisted IPs for this user
        const whitelistedIPs = await prisma.whitelistedIP.findMany({
            where: { userId: session.user.id },
        });

        // Remove each IP from Zoraxy and database
        for (const record of whitelistedIPs) {
            try {
                await ZoraxyService.removeFromWhitelist(record.whitelistId, record.ip);
                await prisma.whitelistedIP.delete({
                    where: { id: record.id },
                });
                console.log(`Revoked IP ${record.ip} from whitelist ${record.whitelistId}`);
            } catch (error) {
                console.error(`Failed to revoke IP ${record.ip}:`, error);
            }
        }

        return { success: true, count: whitelistedIPs.length };
    } catch (error) {
        console.error("Revoking whitelist failed:", error);
        return { success: false, error: "Failed to revoke IP whitelist" };
    }
}
