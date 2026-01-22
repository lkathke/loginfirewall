"use client";

import { useState } from "react";
import { updatePassword } from "./actions";
import { Loader2, Lock, Save, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import TotpPanel from "@/components/totp-panel";
import PasskeyPanel from "@/components/passkey-panel";

export default function ProfilePage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const res = await updatePassword(formData);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Password updated successfully");
                (e.target as HTMLFormElement).reset();
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] p-6 text-white">
            <div className="mx-auto max-w-5xl space-y-6">
                <Link
                    href="/"
                    className="mb-8 flex items-center gap-2 text-slate-400 transition-colors hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>

                <div className="grid items-stretch gap-6 lg:[grid-template-columns:1fr_1.25fr]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex h-full flex-col rounded-2xl border border-white/10 bg-slate-900/50 p-8 shadow-xl"
                    >
                        <div className="mb-8 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                                <Lock className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Security Settings</h1>
                                <p className="text-sm text-slate-400">Update your password</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Current Password</label>
                                <input
                                    name="currentPassword"
                                    type="password"
                                    required
                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">New Password</label>
                                <input
                                    name="newPassword"
                                    type="password"
                                    required
                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Confirm New Password</label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 font-medium text-white transition-all hover:bg-blue-500 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Update Password
                            </button>
                        </form>
                    </motion.div>

                    <TotpPanel className="mt-0 h-full" />
                </div>

                <PasskeyPanel />
            </div>
        </div>
    );
}
