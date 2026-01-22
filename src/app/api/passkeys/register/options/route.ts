import { NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPasskeyRegistrationOptions } from "@/lib/passkeys";

export async function POST() {
    try {
        const session = await getServerSession(authOptions) as Session | null;
        if (!session?.user?.id || !session.user.name) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const options = await getPasskeyRegistrationOptions(session.user.id, session.user.name);
        return NextResponse.json(options);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create options" }, { status: 400 });
    }
}
