import { NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUser() {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }
    return session.user.id;
}

export async function GET() {
    try {
        const userId = await requireUser();
        const passkeys = await prisma.passkey.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                createdAt: true,
                deviceType: true,
                backedUp: true,
            },
        });
        return NextResponse.json({ passkeys });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to load passkeys" }, { status: 400 });
    }
}

export async function DELETE(request: Request) {
    try {
        const userId = await requireUser();
        const body = await request.json();
        const { id } = body || {};
        if (!id) {
            return NextResponse.json({ error: "Passkey id required" }, { status: 400 });
        }

        const pk = await prisma.passkey.findUnique({ where: { id } });
        if (!pk || pk.userId !== userId) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        await prisma.passkey.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to delete passkey" }, { status: 400 });
    }
}
