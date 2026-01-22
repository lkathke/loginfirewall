import { prisma } from "@/lib/prisma";
import { ZoraxyService } from "@/lib/zoraxy";

export async function whitelistUserIP(userId: string, ip: string) {
    // 1. Get user's groups and their whitelist IDs
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            groups: {
                include: {
                    group: true,
                },
            },
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const whitelistIds = user.groups
        .map((ug) => ug.group.whitelistId)
        .filter((id): id is string => !!id); // Filter out null/empty IDs with type guard

    if (whitelistIds.length === 0) {
        return; // No whitelists to update
    }

    // 2. Calculate expiration (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // 3. Update Zoraxy and Database
    for (const whitelistId of whitelistIds) {
        try {
            // Add to Zoraxy
            await ZoraxyService.addToWhitelist(whitelistId, ip);

            // Add/Update DB record
            // Check if this IP is already whitelisted for this user and whitelistId
            const existing = await prisma.whitelistedIP.findFirst({
                where: {
                    userId,
                    whitelistId,
                    ip,
                },
            });

            if (existing) {
                await prisma.whitelistedIP.update({
                    where: { id: existing.id },
                    data: { expiresAt },
                });
            } else {
                await prisma.whitelistedIP.create({
                    data: {
                        userId,
                        whitelistId,
                        ip,
                        expiresAt,
                    },
                });
            }
        } catch (error) {
            console.error(`Failed to whitelist IP ${ip} for whitelist ${whitelistId}:`, error);
            // Continue with other whitelists even if one fails
        }
    }
}

export async function cleanupExpiredIPs() {
    const now = new Date();
    const expiredIPs = await prisma.whitelistedIP.findMany({
        where: {
            expiresAt: {
                lt: now,
            },
        },
    });

    for (const record of expiredIPs) {
        try {
            await ZoraxyService.removeFromWhitelist(record.whitelistId, record.ip);
            await prisma.whitelistedIP.delete({
                where: { id: record.id },
            });
            console.log(`Removed expired IP ${record.ip} from whitelist ${record.whitelistId}`);
        } catch (error) {
            console.error(`Failed to remove expired IP ${record.ip} from whitelist ${record.whitelistId}:`, error);
        }
    }
}
