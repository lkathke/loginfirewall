"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Users, Layers, LayoutDashboard, ArrowLeft } from "lucide-react";

export function AdminMobileNav() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="md:hidden">
            {/* Mobile Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/50 px-4 py-3">
                <span className="text-lg font-bold text-white">Admin Panel</span>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <nav className="border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
                    <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        Overview
                    </Link>
                    <Link
                        href="/admin/users"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
                    >
                        <Users className="h-5 w-5" />
                        Users
                    </Link>
                    <Link
                        href="/admin/groups"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
                    >
                        <Layers className="h-5 w-5" />
                        Groups & Links
                    </Link>
                    <Link
                        href="/"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 border-t border-white/10 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Back to App
                    </Link>
                </nav>
            )}
        </div>
    );
}
