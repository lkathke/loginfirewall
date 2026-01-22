import { NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verifyPasskeyRegistration } from "@/lib/passkeys";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions) as Session | null;
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { attestationResponse, name } = body;

        if (!attestationResponse) {
            return NextResponse.json({ error: "Missing attestation payload" }, { status: 400 });
        }

        await verifyPasskeyRegistration(session.user.id, attestationResponse, name);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Verification failed" }, { status: 400 });
    }
}
