import { getGroups } from "../actions";

export const dynamic = "force-dynamic";

import { GroupList, AddGroupForm } from "./client";

export default async function GroupsPage() {
    const groups = await getGroups();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Groups</h1>
                <p className="text-slate-400">Manage access groups and Zoraxy IDs</p>
            </div>

            <AddGroupForm />
            <GroupList groups={groups} />
        </div>
    );
}
