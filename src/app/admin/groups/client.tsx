"use client";

import { useState } from "react";
import { createGroup, deleteGroup } from "../actions";
import { Trash2, Plus, Loader2, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

import { GroupWithLinks } from "@/types";

export function GroupList({ groups }: { groups: GroupWithLinks[] }) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        setIsDeleting(id);
        try {
            await deleteGroup(id);
            toast.success("Group deleted");
        } catch (e) {
            toast.error("Failed to delete group");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
                <div key={group.id} className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/50 p-6 transition-all hover:border-blue-500/50">
                    <div className="mb-4 flex items-start justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-white">{group.name}</h3>
                            <p className="text-xs text-slate-500 font-mono mt-1">ID: {group.whitelistId}</p>
                        </div>
                        <button
                            onClick={() => handleDelete(group.id)}
                            disabled={isDeleting === group.id}
                            className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                        >
                            {isDeleting === group.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                    </div>

                    <div className="mt-4 border-t border-white/5 pt-4">
                        <div className="flex items-center justify-between text-sm text-slate-400">
                            <span>{group.links?.length || 0} Links</span>
                            <Link href={`/admin/groups/${group.id}`} className="flex items-center gap-1 text-blue-400 hover:text-blue-300">
                                Manage <ExternalLink className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function AddGroupForm() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const res = await createGroup(formData);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Group created");
                (e.target as HTMLFormElement).reset();
            }
        } catch (err) {
            toast.error("Failed to create group");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-900/50 p-4 sm:flex-row sm:gap-4">
            <input
                name="name"
                placeholder="Group Name"
                required
                className="flex-1 rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder-slate-500 outline-none focus:border-blue-500/50"
            />
            <input
                name="whitelistId"
                placeholder="Zoraxy Whitelist ID (optional)"
                className="flex-1 rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder-slate-500 outline-none focus:border-blue-500/50"
            />
            <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50 sm:w-auto"
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Group
            </button>
        </form>
    );
}
