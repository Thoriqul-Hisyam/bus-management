import { readSession } from "@/lib/auth";
import Sidebar from "@/components/SidebarClient";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";

export default async function SidebarWrapper() {
  noStore();
  const session = await readSession();
  return <Sidebar role={session?.role ?? "admin"} />;
}
