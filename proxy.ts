import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");

const PUBLIC = ["/login", "/403", "/_next", "/favicon", "/public", "/img"];

type Guard =
  | { prefix: string; require: string }
  | { prefix: string; requireByMethod: Record<string, string> };

const GUARDS: Guard[] = [
  // dashboard
  { prefix: "/",                   require: "dashboard.read" },

  // master
  { prefix: "/master/bus-type",    require: "master.bus_type.read" },
  { prefix: "/master/bus",         require: "master.bus.read" },
  { prefix: "/master/customers",   require: "master.customers.read" },
  { prefix: "/master/employees",   require: "master.employees.read" },
  { prefix: "/master/position",    require: "master.position.read" },

  // finance & report
  { prefix: "/repayment",          require: "finance.repayment.read" },
  { prefix: "/report/revenue",     require: "report.revenue.read" },

  // schedule input
  { prefix: "/schedule/input/new", require: "schedule.input.create" },
  { prefix: "/schedule/input/",    require: "schedule.input.update" }, // edit: /schedule/input/[id] (pastikan route mengandung trailing /)
  { prefix: "/schedule/input",     require: "schedule.input.read" },

  // trip sheet
  { prefix: "/trip_sheet/create/", require: "trip_sheet.create" },     // /trip_sheet/create/[id]
  { prefix: "/trip_sheet",         require: "trip_sheet.read" },

];

function isPublic(pathname: string) {
  return PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function needPerm(pathname: string, method: string): string | null {
  const matched = GUARDS
    .filter(g => pathname.startsWith(g.prefix))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];

  if (!matched) return null;
  if ("require" in matched) return matched.require;
  const key = method.toUpperCase();
  return matched.requireByMethod[key] ?? null;
}

export default async function proxy(req: NextRequest) {
  const { pathname } = new URL(req.url);
  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: ["HS256"] });
    const userPerms: string[] = Array.isArray(payload.perms) ? (payload.perms as string[]) : [];

    const need = needPerm(pathname, req.method);
    if (need && !userPerms.includes(need)) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)", "/api/:path*"],
};
