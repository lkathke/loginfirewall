import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getUserLinks() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return [];
    }

    const userWithGroups = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            groups: {
                include: {
                    group: {
                        include: {
                            links: true,
                        },
                    },
                },
            },
        },
    });

    if (!userWithGroups) return [];

    // Flatten links from all groups
    const links = userWithGroups.groups.flatMap((ug) => ug.group.links);

    // Deduplicate links by ID (if a link could belong to multiple groups, though schema says link belongs to one group)
    // But a user might be in multiple groups.
    return links;
}
