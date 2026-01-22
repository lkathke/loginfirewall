"use client";

import { useState } from "react";
import { createUser, deleteUser, updateUser, resetUserTotp } from "../actions";
import { Trash2, Plus, Loader2, Pencil, X, Check, ShieldOff, Shield } from "lucide-react";
import { toast } from "react-hot-toast";

import { UserWithRole } from "@/types";

export function UserList({ users }: { users: UserWithRole[] }) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ displayName: "", role: "", newPassword: "" });
    const [isSaving, setIsSaving] = useState(false);
    const [isResettingTotp, setIsResettingTotp] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        setIsDeleting(id);
        try {
            await deleteUser(id);
            toast.success("User deleted");
        } catch (e) {
            toast.error("Failed to delete user");
        } finally {
            setIsDeleting(null);
        }
    };

    const startEdit = (user: UserWithRole) => {
        setEditingId(user.id);
        setEditForm({
            displayName: user.displayName || "",
            role: user.role,
            newPassword: "",
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ displayName: "", role: "", newPassword: "" });
    };

    const saveEdit = async (userId: string) => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("userId", userId);
            formData.append("displayName", editForm.displayName);
            formData.append("role", editForm.role);
            if (editForm.newPassword) {
                formData.append("newPassword", editForm.newPassword);
            }

            const res = await updateUser(formData);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("User updated");
                setEditingId(null);
            }
        } catch (e) {
            toast.error("Failed to update user");
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetTotp = async (userId: string, username: string) => {
        if (!confirm(`Reset 2FA for ${username}? They will need to set it up again.`)) return;
        setIsResettingTotp(userId);
        try {
            await resetUserTotp(userId);
            toast.success("2FA reset successfully");
        } catch (e) {
            toast.error("Failed to reset 2FA");
        } finally {
            setIsResettingTotp(null);
        }
    };

    return (
        <>
            {/* Mobile Card View */}
            <div className="space-y-3 sm:hidden">
                {users.map((user) => (
                    <div key={user.id} className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                        {editingId === user.id ? (
                            <div className="space-y-3">
                                <input
                                    value={editForm.displayName}
                                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                                    placeholder="Display Name (optional)"
                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                                />
                                <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                                >
                                    <option value="USER">User</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                                <input
                                    type="password"
                                    value={editForm.newPassword}
                                    onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                                    placeholder="New Password (leave empty to keep)"
                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={cancelEdit} disabled={isSaving} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white">
                                        <X className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => saveEdit(user.id)} disabled={isSaving} className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-500 disabled:opacity-50">
                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-medium text-white">{user.displayName || user.username}</p>
                                        {user.displayName && <p className="text-xs text-slate-500">@{user.username}</p>}
                                        <p className="text-xs text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                            {user.role}
                                        </span>
                                        {user.totpEnabled && (
                                            <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400">
                                                <Shield className="mr-1 h-3 w-3" />2FA
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center justify-end gap-1 border-t border-white/5 pt-3">
                                    {user.totpEnabled && (
                                        <button
                                            onClick={() => handleResetTotp(user.id, user.username)}
                                            disabled={isResettingTotp === user.id}
                                            className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-orange-400"
                                            title="Reset 2FA"
                                        >
                                            {isResettingTotp === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldOff className="h-4 w-4" />}
                                        </button>
                                    )}
                                    <button onClick={() => startEdit(user)} className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-blue-400">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        disabled={isDeleting === user.id || user.username === 'admin'}
                                        className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-red-400 disabled:opacity-50"
                                    >
                                        {isDeleting === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden overflow-hidden rounded-xl border border-white/10 bg-slate-900/50 sm:block">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-white/5 text-xs uppercase text-slate-300">
                        <tr>
                            <th className="px-4 py-3 md:px-6 md:py-4">User</th>
                            <th className="px-4 py-3 md:px-6 md:py-4">Role</th>
                            <th className="px-4 py-3 md:px-6 md:py-4">2FA</th>
                            <th className="px-4 py-3 md:px-6 md:py-4">Created</th>
                            <th className="px-4 py-3 text-right md:px-6 md:py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5">
                                {editingId === user.id ? (
                                    <td colSpan={5} className="px-4 py-3 md:px-6 md:py-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <input
                                                value={editForm.displayName}
                                                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                                                placeholder="Display Name"
                                                className="rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500/50"
                                            />
                                            <select
                                                value={editForm.role}
                                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                                className="rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500/50"
                                            >
                                                <option value="USER">User</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                            <input
                                                type="password"
                                                value={editForm.newPassword}
                                                onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                                                placeholder="New Password"
                                                className="rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500/50"
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={cancelEdit} disabled={isSaving} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white">
                                                    <X className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => saveEdit(user.id)} disabled={isSaving} className="rounded-lg bg-blue-600 p-1.5 text-white hover:bg-blue-500 disabled:opacity-50">
                                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                ) : (
                                    <>
                                        <td className="px-4 py-3 md:px-6 md:py-4">
                                            <div>
                                                <p className="font-medium text-white">{user.displayName || user.username}</p>
                                                {user.displayName && <p className="text-xs text-slate-500">@{user.username}</p>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 md:px-6 md:py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 md:px-6 md:py-4">
                                            {user.totpEnabled ? (
                                                <span className="inline-flex items-center gap-1 text-green-400">
                                                    <Shield className="h-4 w-4" /> Enabled
                                                </span>
                                            ) : (
                                                <span className="text-slate-500">Disabled</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 md:px-6 md:py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-right md:px-6 md:py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                {user.totpEnabled && (
                                                    <button
                                                        onClick={() => handleResetTotp(user.id, user.username)}
                                                        disabled={isResettingTotp === user.id}
                                                        className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-orange-400"
                                                        title="Reset 2FA"
                                                    >
                                                        {isResettingTotp === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldOff className="h-4 w-4" />}
                                                    </button>
                                                )}
                                                <button onClick={() => startEdit(user)} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-blue-400">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    disabled={isDeleting === user.id || user.username === 'admin'}
                                                    className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-red-400 disabled:opacity-50"
                                                >
                                                    {isDeleting === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export function AddUserForm() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const res = await createUser(formData);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("User created");
                (e.target as HTMLFormElement).reset();
            }
        } catch (err) {
            toast.error("Failed to create user");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-white/10 bg-slate-900/50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <input
                    name="username"
                    placeholder="Username"
                    required
                    className="flex-1 rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder-slate-500 outline-none focus:border-blue-500/50"
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                    className="flex-1 rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder-slate-500 outline-none focus:border-blue-500/50"
                />
            </div>
            <div className="mt-3 flex flex-col gap-3 sm:mt-0 sm:flex-row sm:gap-4 sm:pt-4">
                <select
                    name="role"
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white outline-none focus:border-blue-500/50 sm:w-auto"
                >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                </select>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50 sm:w-auto"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Add User
                </button>
            </div>
        </form>
    );
}
