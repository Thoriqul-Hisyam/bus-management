import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

type AppRole = "admin" | "finance" | "manager" | "superadmin";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");
const PUBLIC = ["/login", "/_next", "/favicon", "/public"];

type Rule =
  | { prefix: string; allow: AppRole[] }
  | { prefix: string; minRole: AppRole };

const RBAC: Rule[] = [
  { prefix: "/report",          minRole: "finance" },              // finance+ (finance, manager, superadmin)
  { prefix: "/repayment",       minRole: "finance" },
  { prefix: "/master/position", allow: ["manager", "superadmin"] } // manager OR superadmin
  // tambah aturan lain…
];

const RANK: Record<AppRole, number> = { admin:1, finance:2, manager:3, superadmin:4 };

function isPublic(pathname: string) {
  return PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function canAccess(role: AppRole, rule: Rule) {
  if ("allow" in rule) return rule.allow.includes(role);
  return RANK[role] >= RANK[rule.minRole];
}

export default async function proxy(req: NextRequest) {
  const { pathname } = new URL(req.url);
  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: ["HS256"] });
    const role = String(payload.role || "admin") as AppRole;

    const rule = RBAC.find((g) => pathname.startsWith(g.prefix));
    if (rule && !canAccess(role, rule)) {
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
