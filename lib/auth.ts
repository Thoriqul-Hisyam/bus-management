// lib/auth.ts
import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const COOKIE_NAME = "auth_token";
const ALG = "HS256";
const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");

export type Session = {
  sub: number;              // account id
  empId: number;            // employee id
  name: string;             // display name
  positionName: string|null;// Position.name (role)
  perms: string[];          // permission codes
};

export async function signSession(payload: Session, maxAgeSec = 60 * 60 * 8) {
  const jwt = await new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSec}s`)
    .sign(SECRET);

  const jar = await cookies();
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
  const jar = await cookies();
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
  const jar = await cookies();
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

export function hasPerm(session: Session | null, ...need: string[]) {
  if (!session) return false;
  const set = new Set(session.perms);
  return need.some(n => set.has(n));
}
