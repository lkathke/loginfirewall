"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, User, Key, Loader2, ShieldCheck, Fingerprint } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { startAuthentication } from "@simplewebauthn/browser";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [totp, setTotp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                username,
                password,
                totp,
                redirect: false,
            });

            if (result?.error) {
                toast.error("Invalid credentials or 2FA code");
            } else {
                toast.success("Login successful");
                router.push("/");
                router.refresh();
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasskey = async () => {
        if (!username) {
            toast.error("Bitte zuerst Benutzername eingeben");
            return;
        }
        setIsPasskeyLoading(true);
        try {
            const resp = await fetch("/api/passkeys/auth/options", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });
            const options = await resp.json();
            if (!resp.ok) throw new Error(options?.error || "Cannot start passkey");

            const assertion = await startAuthentication(options);
            const result = await signIn("credentials", {
                username,
                passkeyAssertion: JSON.stringify(assertion),
                redirect: false,
            });

            if (result?.error) {
                toast.error("Passkey Anmeldung fehlgeschlagen");
            } else {
                toast.success("Login erfolgreich");
                router.push("/");
                router.refresh();
            }
        } catch (error: any) {
            toast.error(error?.message || "Passkey Login fehlgeschlagen");
        } finally {
            setIsPasskeyLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="glass-card relative overflow-hidden border-t border-white/10 bg-slate-900/50 backdrop-blur-xl">
                    {/* Decorative gradient blob */}
                    <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl"></div>
                    <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl"></div>

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="mb-6 rounded-full bg-white/5 p-4 ring-1 ring-white/10">
                            <Lock className="h-8 w-8 text-blue-400" />
                        </div>
                        <h1 className="mb-2 text-2xl font-bold text-white">Welcome Back</h1>
                        <p className="mb-8 text-slate-400">Sign in to access your secure dashboard</p>

                        <form onSubmit={handleSubmit} className="w-full space-y-4">
                            <div className="group relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-slate-500 transition-colors group-focus-within:text-blue-400" />
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full rounded-lg border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500/50 focus:bg-black/40 focus:ring-2 focus:ring-blue-500/20"
                                    required
                                />
                            </div>

                            <div className="group relative">
                                <Key className="absolute left-3 top-3 h-5 w-5 text-slate-500 transition-colors group-focus-within:text-blue-400" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-lg border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500/50 focus:bg-black/40 focus:ring-2 focus:ring-blue-500/20"
                                    required
                                />
                            </div>

                            <div className="group relative">
                                <ShieldCheck className="absolute left-3 top-3 h-5 w-5 text-slate-500 transition-colors group-focus-within:text-blue-400" />
                                <input
                                    type="text"
                                    placeholder="2FA code (if enabled)"
                                    value={totp}
                                    onChange={(e) => setTotp(e.target.value)}
                                    className="w-full rounded-lg border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500/50 focus:bg-black/40 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="mt-6 flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] hover:shadow-blue-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    "Sign In"
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handlePasskey}
                                disabled={isPasskeyLoading}
                                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white transition hover:border-white/30 disabled:opacity-60"
                            >
                                {isPasskeyLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Fingerprint className="h-5 w-5" />}
                                Mit Passkey anmelden
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
