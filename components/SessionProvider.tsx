"use client";
import { createContext, useContext } from "react";

export type AppSession = {
  name: string;
  positionName: string | null;
  perms: string[];
} | null;

const SessionCtx = createContext<AppSession>(null);

export function SessionProvider({
  value,
  children,
}: {
  value: AppSession;
  children: React.ReactNode;
}) {
  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

export function useSession() {
  return useContext(SessionCtx);
}

/** Helper global: cek minimal salah satu permission ada */
export function useHasPerm(...need: string[]) {
  const s = useSession();
  if (!s || !Array.isArray(s.perms)) return false;
  const set = new Set(s.perms);
  return need.some((n) => set.has(n));
}
