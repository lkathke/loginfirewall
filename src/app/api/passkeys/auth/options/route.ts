import { NextResponse } from "next/server";
import { getPasskeyAuthOptions } from "@/lib/passkeys";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username } = body || {};
        if (!username) {
            return NextResponse.json({ error: "Username required" }, { status: 400 });
        }

        const options = await getPasskeyAuthOptions(username);
        return NextResponse.json(options);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to build options" }, { status: 400 });
    }
}
