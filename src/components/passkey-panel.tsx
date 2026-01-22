"use client";

import { useEffect, useState } from "react";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { Loader2, KeyRound, Plus, Trash2, RefreshCcw } from "lucide-react";
import { toast } from "react-hot-toast";

type PasskeyItem = {
    id: string;
    name?: string | null;
    createdAt: string;
    deviceType?: string | null;
    backedUp?: boolean | null;
};

async function fetchJson(url: string, opts?: RequestInit) {
    const res = await fetch(url, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Request failed");
    return data;
}

export default function PasskeyPanel() {
    const [passkeys, setPasskeys] = useState<PasskeyItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [label, setLabel] = useState("");

    const load = async () => {
        setIsLoading(true);
        try {
            const data = await fetchJson("/api/passkeys", { method: "GET" });
            setPasskeys(data.passkeys || []);
        } catch (err: any) {
            toast.error(err?.message || "Could not load passkeys");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleRegister = async () => {
        setIsRegistering(true);
        try {
            const options = await fetchJson("/api/passkeys/register/options", { method: "POST" });
            const attResp = await startRegistration(options);
            await fetchJson("/api/passkeys/register/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ attestationResponse: attResp, name: label || undefined }),
            });
            toast.success("Passkey added");
            setLabel("");
            await load();
        } catch (err: any) {
            toast.error(err?.message || "Could not register passkey");
        } finally {
            setIsRegistering(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Passkey löschen?")) return;
        try {
            await fetchJson("/api/passkeys", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            toast.success("Passkey entfernt");
            await load();
        } catch (err: any) {
            toast.error(err?.message || "Konnte Passkey nicht löschen");
        }
    };

    return (
        <div className="min-h-full rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-amber-300" />
                    <div>
                        <h2 className="text-lg font-semibold text-white">Passkeys</h2>
                        <p className="text-xs text-slate-400">Plattform- & Geräte-gebunden anmelden</p>
                    </div>
                </div>
                <button
                    onClick={load}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-200 transition hover:border-white/30 disabled:opacity-50"
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
                    Refresh
                </button>
            </div>

            <div className="mb-4 flex flex-col gap-2 rounded-xl border border-white/10 bg-black/20 p-4 md:flex-row md:items-center">
                <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Gerätename (optional)"
                    className="flex-1 rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                />
                <button
                    onClick={handleRegister}
                    disabled={isRegistering}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
                >
                    {isRegistering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Passkey hinzufügen
                </button>
            </div>

            <div className="space-y-2">
                {passkeys.length === 0 && (
                    <div className="rounded-lg border border-dashed border-white/10 px-4 py-6 text-center text-sm text-slate-400">
                        Keine Passkeys gespeichert
                    </div>
                )}
                {passkeys.map((pk) => (
                    <div key={pk.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/40 px-4 py-3">
                        <div>
                            <p className="text-sm font-semibold text-white">{pk.name || "Passkey"}</p>
                            <p className="text-xs text-slate-400">
                                {pk.deviceType || "Unbekannt"} • {pk.backedUp ? "Backed up" : "Not backed up"} •{" "}
                                {new Date(pk.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <button
                            onClick={() => handleDelete(pk.id)}
                            className="rounded p-2 text-slate-300 transition hover:bg-white/10 hover:text-red-300"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
