import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

import { Users, Layers, Link as LinkIcon } from "lucide-react";
import TotpPanel from "@/components/totp-panel";
import PasskeyPanel from "@/components/passkey-panel";

export default async function AdminDashboard() {
    const userCount = await prisma.user.count();
    const groupCount = await prisma.group.count();
    const linkCount = await prisma.link.count();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Overview</h1>
                <p className="text-slate-400">System statistics and status</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
                <div className="glass-card flex items-center gap-4 bg-slate-900/50">
                    <div className="rounded-lg bg-blue-500/10 p-3 text-blue-400">
                        <Users className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-400">Total Users</p>
                        <p className="text-2xl font-bold text-white">{userCount}</p>
                    </div>
                </div>

                <div className="glass-card flex items-center gap-4 bg-slate-900/50">
                    <div className="rounded-lg bg-purple-500/10 p-3 text-purple-400">
                        <Layers className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-400">Total Groups</p>
                        <p className="text-2xl font-bold text-white">{groupCount}</p>
                    </div>
                </div>

                <div className="glass-card flex items-center gap-4 bg-slate-900/50">
                    <div className="rounded-lg bg-emerald-500/10 p-3 text-emerald-400">
                        <LinkIcon className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-400">Active Links</p>
                        <p className="text-2xl font-bold text-white">{linkCount}</p>
                    </div>
                </div>
            </div>

            <TotpPanel title="Admin 2FA" subtitle="Scan or verify your TOTP code from the admin panel" />
            <PasskeyPanel />
        </div>
    );
}
