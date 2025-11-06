"use client";
import { createContext, useContext } from "react";
type AppRole = "superadmin" | "manager" | "finance" | "admin";
type Session = { name: string; role: AppRole } | null;

const SessionCtx = createContext<Session>(null);
export function SessionProvider({ value, children }: { value: Session; children: React.ReactNode }) {
  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}
export function useSession() {
  return useContext(SessionCtx);
}
