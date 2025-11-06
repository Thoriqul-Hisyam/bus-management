// app/proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");

const PUBLIC = ["/login", "/_next", "/favicon", "/public"];

const RBAC: Array<{ prefix: string; minRole: "admin"|"finance"|"manager"|"superadmin" }> = [
  { prefix: "/report",          minRole: "finance" },
  { prefix: "/repayment",       minRole: "finance" },
  { prefix: "/master/position", minRole: "manager" },
  // tambah aturan lain di sini
];

const RANK = { admin: 1, finance: 2, manager: 3, superadmin: 4 } as const;

function isPublic(pathname: string) {
  return PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export default async function proxy(req: NextRequest) {
  const { pathname } = new URL(req.url);
  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: ["HS256"] });
    const role = String(payload.role || "admin") as keyof typeof RANK;

    const guard = RBAC.find((g) => pathname.startsWith(g.prefix));
    if (guard && RANK[role] < RANK[guard.minRole]) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
