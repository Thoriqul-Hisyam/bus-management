import { readSession } from "@/lib/auth";

export async function requirePermission(...need: string[]) {
  const session = await readSession();
  if (!session) throw new Error("Unauthorized");
  const ok = session.perms.some(p => need.includes(p));
  if (!ok) throw new Error("Forbidden");
  return session;
}
