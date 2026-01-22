import { User, Group, Link, UserGroup } from "@prisma/client";

export type UserWithRole = Pick<User, "id" | "username" | "displayName" | "role" | "totpEnabled" | "createdAt">;

export type GroupWithLinks = Group & {
    links: Link[];
};

export type GroupWithDetails = Group & {
    links: Link[];
    users: (UserGroup & { user: User })[];
};

export type DashboardLink = Link;
