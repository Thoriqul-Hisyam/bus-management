import { readSession } from "@/lib/auth";
import { unstable_noStore as noStore } from "next/cache";
import NavbarClient from "./NavbarClient";

export const dynamic = "force-dynamic";

export default async function Navbar() {
  noStore();
  const session = await readSession();

  return (
    <NavbarClient
      name={session?.name ?? "Guest"}
      positionName={session?.positionName ?? null}
    />
  );
}
