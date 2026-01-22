import { getGroup } from "../../actions-groups";
import { LinkList, AddLinkForm, GroupMembers, AddMemberForm, GroupHeader } from "./client";
import { notFound } from "next/navigation";

export default async function GroupDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const group = await getGroup(id);

    if (!group) {
        notFound();
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            <GroupHeader groupId={group.id} initialName={group.name} whitelistId={group.whitelistId} />

            <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
                <div>
                    <AddLinkForm groupId={group.id} />
                    <LinkList links={group.links} groupId={group.id} />
                </div>

                <div>
                    <AddMemberForm groupId={group.id} />
                    <GroupMembers members={group.users} groupId={group.id} />
                </div>
            </div>
        </div>
    );
}
