import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserLinks } from "@/lib/user-service";
import DashboardClient from "./dashboard-client";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const links = await getUserLinks();

  return <DashboardClient session={session} links={links} />;
}
