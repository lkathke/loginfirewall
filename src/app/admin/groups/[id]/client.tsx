"use client";

import { useState } from "react";
import { addLink, deleteLink, updateLink, addUserToGroup, removeUserFromGroup } from "../../actions-groups";
import { updateGroup } from "../../actions";
import { Trash2, Plus, Loader2, UserPlus, UserMinus, Pencil, X, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { DynamicIcon } from "@/components/dynamic-icon";

import { Link as LinkModel, UserGroup, User } from "@prisma/client";

export function GroupHeader({ groupId, initialName, whitelistId }: { groupId: string; initialName: string; whitelistId: string | null }) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(initialName);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Name cannot be empty");
            return;
        }
        setIsSaving(true);
        try {
            const res = await updateGroup(groupId, name);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Group renamed");
                setIsEditing(false);
            }
        } catch (e) {
            toast.error("Failed to rename group");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setName(initialName);
        setIsEditing(false);
    };

    return (
        <div>
            {isEditing ? (
                <div className="space-y-3 sm:flex sm:items-center sm:gap-3 sm:space-y-0">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full text-2xl font-bold bg-black/20 border border-white/10 rounded-lg px-3 py-1 text-white outline-none focus:border-blue-500/50 sm:w-auto sm:text-3xl"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-500 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-white sm:text-3xl">{initialName}</h1>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-blue-400"
                    >
                        <Pencil className="h-5 w-5" />
                    </button>
                </div>
            )}
            <p className="text-slate-400 mt-1">
                {whitelistId ? `Whitelist ID: ${whitelistId}` : <span className="text-slate-500">No Zoraxy Whitelist</span>}
            </p>
        </div>
    );
}

export function LinkList({ links, groupId }: { links: LinkModel[], groupId: string }) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ title: "", url: "", icon: "" });
    const [isSaving, setIsSaving] = useState(false);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        setIsDeleting(id);
        try {
            await deleteLink(id, groupId);
            toast.success("Link deleted");
        } catch (e) {
            toast.error("Failed to delete link");
        } finally {
            setIsDeleting(null);
        }
    };

    const startEdit = (link: LinkModel) => {
        setEditingId(link.id);
        setEditForm({ title: link.title, url: link.url, icon: link.icon });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ title: "", url: "", icon: "" });
    };

    const saveEdit = async (linkId: string) => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("linkId", linkId);
            formData.append("title", editForm.title);
            formData.append("url", editForm.url);
            formData.append("icon", editForm.icon);
            formData.append("groupId", groupId);

            const res = await updateLink(formData);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Link updated");
                setEditingId(null);
            }
        } catch (e) {
            toast.error("Failed to update link");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Service Links</h3>
            <div className="grid gap-4 sm:grid-cols-2">
                {links.map((link) => (
                    <div key={link.id} className="rounded-lg border border-white/10 bg-slate-900/50 p-4">
                        {editingId === link.id ? (
                            <div className="space-y-3">
                                <input
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    placeholder="Title"
                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                                />
                                <input
                                    value={editForm.url}
                                    onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                                    placeholder="URL"
                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                                />
                                <input
                                    value={editForm.icon}
                                    onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                                    placeholder="Icon (name or URL)"
                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={cancelEdit}
                                        disabled={isSaving}
                                        className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => saveEdit(link.id)}
                                        disabled={isSaving}
                                        className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-500 disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                                        <DynamicIcon name={link.icon} className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{link.title}</p>
                                        <p className="text-xs text-slate-500 truncate max-w-[150px] sm:max-w-[200px]">{link.url}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => startEdit(link)}
                                        className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-blue-400"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(link.id)}
                                        disabled={isDeleting === link.id}
                                        className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-red-400"
                                    >
                                        {isDeleting === link.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AddLinkForm({ groupId }: { groupId: string }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        formData.append("groupId", groupId);

        try {
            const res = await addLink(formData);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Link added");
                (e.target as HTMLFormElement).reset();
            }
        } catch (err) {
            toast.error("Failed to add link");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-white/10 bg-slate-900/50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <input name="title" placeholder="Title" required className="flex-1 rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white outline-none focus:border-blue-500/50" />
                <input name="url" placeholder="URL" required className="flex-1 rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white outline-none focus:border-blue-500/50 sm:flex-[2]" />
            </div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <input name="icon" placeholder="Icon (optional)" className="flex-1 rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white outline-none focus:border-blue-500/50 sm:w-32 sm:flex-none" />
                <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-50 sm:w-auto">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    <span className="sm:hidden">Add Link</span>
                </button>
            </div>
        </form>
    );
}

export function GroupMembers({ members, groupId }: { members: (UserGroup & { user: User })[], groupId: string }) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleRemove = async (userId: string) => {
        if (!confirm("Remove user from group?")) return;
        setIsDeleting(userId);
        try {
            await removeUserFromGroup(userId, groupId);
            toast.success("User removed");
        } catch (e) {
            toast.error("Failed to remove user");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Members</h3>
            <div className="rounded-xl border border-white/10 bg-slate-900/50">
                <table className="w-full text-left text-sm text-slate-400">
                    <tbody className="divide-y divide-white/5">
                        {members.map((m) => (
                            <tr key={m.userId} className="hover:bg-white/5">
                                <td className="px-4 py-3 text-white sm:px-6">{m.user.username}</td>
                                <td className="px-4 py-3 text-right sm:px-6">
                                    <button
                                        onClick={() => handleRemove(m.userId)}
                                        disabled={isDeleting === m.userId}
                                        className="text-slate-500 hover:text-red-400"
                                    >
                                        {isDeleting === m.userId ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function AddMemberForm({ groupId }: { groupId: string }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        formData.append("groupId", groupId);

        try {
            const res = await addUserToGroup(formData);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("User added");
                (e.target as HTMLFormElement).reset();
            }
        } catch (err) {
            toast.error("Failed to add user");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <input name="username" placeholder="Username to add" required className="flex-1 rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white outline-none focus:border-blue-500/50" />
            <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-50 sm:w-auto">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Add
            </button>
        </form>
    );
}
