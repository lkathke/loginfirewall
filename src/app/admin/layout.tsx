import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Layers, LayoutDashboard, ArrowLeft } from "lucide-react";
import { AdminMobileNav } from "./mobile-nav";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "ADMIN") {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-[#0f172a]">
            {/* Mobile Navigation */}
            <AdminMobileNav />

            <div className="flex">
                {/* Desktop Sidebar */}
                <aside className="sticky top-0 hidden h-screen w-64 border-r border-white/10 bg-slate-900/50 backdrop-blur-xl md:block">
                    <div className="flex h-16 items-center border-b border-white/10 px-6">
                        <span className="text-lg font-bold text-white">Admin Panel</span>
                    </div>

                    <nav className="space-y-1 p-4">
                        <Link
                            href="/admin"
                            className="flex items-center gap-3 rounded-lg px-4 py-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                        >
                            <LayoutDashboard className="h-5 w-5" />
                            Overview
                        </Link>
                        <Link
                            href="/admin/users"
                            className="flex items-center gap-3 rounded-lg px-4 py-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                        >
                            <Users className="h-5 w-5" />
                            Users
                        </Link>
                        <Link
                            href="/admin/groups"
                            className="flex items-center gap-3 rounded-lg px-4 py-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                        >
                            <Layers className="h-5 w-5" />
                            Groups & Links
                        </Link>
                    </nav>

                    <div className="absolute bottom-4 left-0 w-64 px-4">
                        <Link
                            href="/"
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to App
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="min-h-screen flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
