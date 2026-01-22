"use client";

import { useEffect, useState } from "react";
import { getTotpSetup, enableTotp, disableTotp } from "@/app/totp/actions";
import { Copy, Loader2, RefreshCcw, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "react-hot-toast";
import clsx from "clsx";

type TotpSetup = {
    enabled: boolean;
    secret?: string | null;
    otpauthUrl?: string | null;
    qrDataUrl?: string | null;
    error?: string;
};

export default function TotpPanel({
    title = "Two-Factor Authentication",
    subtitle = "Protect your account with a TOTP app",
    className = "",
}: {
    title?: string;
    subtitle?: string;
    className?: string;
}) {
    const [data, setData] = useState<TotpSetup | null>(null);
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isDisabling, setIsDisabling] = useState(false);

    const load = async () => {
        setIsLoading(true);
        try {
            const res = await getTotpSetup();
            setData(res);
        } catch (err: any) {
            toast.error(err?.message || "Failed to load 2FA setup");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const copy = async (value?: string | null) => {
        if (!value) return;
        await navigator.clipboard.writeText(value);
        toast.success("Copied");
    };

    const handleEnable = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);
        try {
            const res = await enableTotp(code.trim());
            if (res?.error) {
                toast.error(res.error);
            } else {
                toast.success("2FA enabled");
                setCode("");
                await load();
            }
        } catch (err: any) {
            toast.error(err?.message || "Could not enable 2FA");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleDisable = async () => {
        if (!confirm("Disable 2FA for your account?")) return;
        setIsDisabling(true);
        try {
            const res = await disableTotp();
            const error = (res as any)?.error;
            if (error) {
                toast.error(error);
            } else {
                toast.success("2FA disabled");
                setCode("");
                await load();
            }
        } catch (err: any) {
            toast.error(err?.message || "Could not disable 2FA");
        } finally {
            setIsDisabling(false);
        }
    };

    return (
        <div className={clsx("rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-xl", "flex h-full flex-col", className)}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-blue-400" />
                        <h2 className="text-lg font-semibold text-white">{title}</h2>
                    </div>
                    <p className="text-sm text-slate-400">{subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${data?.enabled ? "bg-emerald-500/10 text-emerald-300" : "bg-yellow-500/10 text-yellow-200"}`}>
                        {data?.enabled ? "Enabled" : "Disabled"}
                    </span>
                    <button
                        onClick={load}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-200 transition hover:border-white/30"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
                        Refresh
                    </button>
                    {data?.enabled && (
                        <button
                            onClick={handleDisable}
                            disabled={isDisabling}
                            className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
                        >
                            {isDisabling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldOff className="h-3.5 w-3.5" />}
                            Disable
                        </button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <p className="text-sm font-medium text-slate-300">Scan this QR code</p>
                        <p className="text-xs text-slate-400">Use Google Authenticator, Authy, 1Password, etc.</p>
                        <div className="mt-4 flex items-center justify-center rounded-lg bg-white/5 p-4">
                            {data?.qrDataUrl ? (
                                <img src={data.qrDataUrl} alt="TOTP QR" className="h-40 w-40 rounded" />
                            ) : (
                                <div className="flex h-40 w-40 items-center justify-center text-slate-500">
                                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "No QR yet"}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <p className="text-sm font-medium text-slate-300">Manual key</p>
                        <p className="text-xs text-slate-400">Enter this secret in your authenticator app if you cannot scan.</p>
                        <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 font-mono text-sm text-white">
                            <span className="truncate">{data?.secret || "—"}</span>
                            <button
                                type="button"
                                onClick={() => copy(data?.secret)}
                                className="ml-2 rounded p-1 text-slate-300 hover:bg-white/10"
                            >
                                <Copy className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <p className="text-sm font-medium text-slate-300">Activate 2FA</p>
                        <p className="text-xs text-slate-400">Scan the QR, generate a 6-digit code, then confirm.</p>
                        <form onSubmit={handleEnable} className="mt-4 space-y-3">
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="123 456"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-4 py-2 text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                            />
                            <button
                                type="submit"
                                disabled={isVerifying}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
                            >
                                {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                {data?.enabled ? "Re-verify code" : "Enable 2FA"}
                            </button>
                        </form>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-slate-400">
                        <p className="font-semibold text-slate-200">Heads-up</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                            <li>QR code stays available here for rescans.</li>
                            <li>Use a TOTP app that supports 30s rotating codes.</li>
                            <li>Keep the secret safe; anyone with it can generate codes.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
