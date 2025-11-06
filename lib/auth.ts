// lib/auth.ts
import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const COOKIE_NAME = "auth_token";
const ALG = "HS256";
const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");

export type AppRole = "superadmin" | "manager" | "finance" | "admin";

export type Session = {
  sub: number;
  empId: number;
  name: string;
  role: AppRole;
};

function normRole(raw?: string | null): AppRole {
  const v = (raw || "").toLowerCase().trim();
  if (v === "superadmin") return "superadmin";
  if (v === "manager") return "manager";
  if (v === "finance") return "finance";
  return "admin";
}

export async function signSession(payload: Session, maxAgeSec = 60 * 60 * 8) {
  const jwt = await new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSec}s`)
    .sign(SECRET);

  const jar = await cookies(); // ⬅️ penting
  jar.set({
    name: COOKIE_NAME,
    value: jwt,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSec,
  });
}

export async function readSession(): Promise<Session | null> {
  const jar = await cookies(); // ⬅️ penting
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: [ALG] });
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const jar = await cookies(); // ⬅️ penting
  jar.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function roleAllows(role: AppRole, needed: AppRole | AppRole[]) {
  const set = Array.isArray(needed) ? needed : [needed];
  const rank: Record<AppRole, number> = {
    superadmin: 4,
    manager: 3,
    finance: 2,
    admin: 1,
  };
  const r = rank[role];
  return set.some((need) => r >= rank[need]);
}

export { normRole };
