"use client";

import { useEffect, useState } from "react";
import { performIpWhitelist, revokeIpWhitelist } from "./actions";
import { signOut } from "next-auth/react";
import { Shield, LogOut, ExternalLink, Settings, User, ChevronDown, ShieldOff } from "lucide-react";
import { DynamicIcon } from "@/components/dynamic-icon";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "react-hot-toast";

import { DashboardLink } from "@/types";
import { Session } from "next-auth";

export default function DashboardClient({ session, links }: { session: Session | null, links: DashboardLink[] }) {
    const [whitelistedIp, setWhitelistedIp] = useState<string | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const initWhitelist = async () => {
            const result = await performIpWhitelist();
            if (result.success && result.ip) {
                setWhitelistedIp(result.ip);
                toast.success(`IP ${result.ip} whitelisted for 24h`, {
                    icon: '🛡️',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                });
            }
        };

        initWhitelist();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setMenuOpen(false);
        if (menuOpen) {
            document.addEventListener("click", handleClickOutside);
            return () => document.removeEventListener("click", handleClickOutside);
        }
    }, [menuOpen]);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                            <Shield className="h-6 w-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">LoginFirewall</span>
                    </div>

                    <div className="relative">
                        <button
                            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                            className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 hover:bg-white/5 transition-colors"
                        >
                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
                            <span className="text-sm font-medium text-slate-300 hidden sm:block">{session?.user?.name}</span>
                            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-slate-900 py-2 shadow-xl">
                                <div className="px-4 py-2 border-b border-white/10">
                                    <p className="text-sm font-medium text-white">{session?.user?.name}</p>
                                    <p className="text-xs text-slate-500">{session?.user?.role}</p>
                                </div>

                                {session?.user?.role === "ADMIN" && (
                                    <Link
                                        href="/admin"
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                                    >
                                        <Settings className="h-4 w-4" />
                                        Admin
                                    </Link>
                                )}

                                <Link
                                    href="/profile"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                                >
                                    <User className="h-4 w-4" />
                                    Profile
                                </Link>

                                <div className="border-t border-white/10 mt-1 pt-1">
                                    <button
                                        onClick={() => signOut()}
                                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign Out
                                    </button>
                                    <button
                                        onClick={async () => {
                                            toast.loading("Revoking access...", { id: "revoke" });
                                            await revokeIpWhitelist();
                                            toast.success("Access revoked", { id: "revoke" });
                                            signOut();
                                        }}
                                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300"
                                    >
                                        <ShieldOff className="h-4 w-4" />
                                        Lock & Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 sm:mb-12"
                >
                    <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">Dashboard</h1>
                    <p className="text-sm text-slate-400 sm:text-base">
                        Your IP <span className="font-mono text-blue-400">{whitelistedIp || "..."}</span> is whitelisted.
                    </p>
                </motion.div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {links.length === 0 ? (
                        <div className="col-span-full text-center text-slate-500 py-12">
                            No services available. Contact your administrator.
                        </div>
                    ) : (
                        links.map((link) => (
                            <motion.a
                                key={link.id}
                                variants={item}
                                href={link.url}
                                target="_blank"
                                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-4 transition-all hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 sm:p-6"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                                <div className="relative z-10 flex items-start justify-between">
                                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors sm:h-12 sm:w-12">
                                        <DynamicIcon name={link.icon} className="h-5 w-5 sm:h-6 sm:w-6" imageClassName="h-full w-full object-cover" />
                                    </div>
                                    <ExternalLink className="h-5 w-5 text-slate-500 transition-colors group-hover:text-blue-400" />
                                </div>
                                <div className="relative z-10 mt-3 sm:mt-4">
                                    <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors sm:text-lg">{link.title}</h3>
                                    <p className="mt-1 text-xs text-slate-400 truncate sm:text-sm">{link.url}</p>
                                </div>
                            </motion.a>
                        ))
                    )}
                </motion.div>
            </main>
        </div>
    );
}
