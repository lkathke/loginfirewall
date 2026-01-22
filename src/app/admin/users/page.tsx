import { getUsers } from "../actions";

export const dynamic = "force-dynamic";

import { UserList, AddUserForm } from "./client";

export default async function UsersPage() {
    const users = await getUsers();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Users</h1>
                <p className="text-slate-400">Manage system access</p>
            </div>

            <AddUserForm />
            <UserList users={users} />
        </div>
    );
}
