import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");
const PUBLIC = ["/login", "/_next", "/favicon", "/public", "/img"];

function isPublic(pathname: string) {
  return PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/** Tentukan permission yang dibutuhkan berdasarkan pola path (spesifik → umum). */
function resolveRequiredPermission(pathname: string): string | null {
  // ===== Dashboard
  if (pathname === "/") return "dashboard.read";

  // ===== Schedule Input
  if (pathname === "/schedule/input/new") return "schedule.input.create";
  if (/^\/schedule\/input\/[^/]+\/edit\/?$/.test(pathname)) return "schedule.input.update";
  if (pathname === "/schedule/input" || /^\/schedule\/input\/[^/]+\/?$/.test(pathname)) {
    return "schedule.input.read";
  }

  // ===== Trip Sheet
  if (/^\/trip_sheet\/create\/[^/]+\/?$/.test(pathname)) return "trip_sheet.write";
  if (pathname === "/trip_sheet") return "trip_sheet.print";

  // ===== Repayment & Report (flat)
  if (pathname === "/repayment") return "finance.repayment.read";
  if (pathname === "/report/revenue") return "report.revenue.read";

  // ===== Master: Position
  if (pathname === "/master/position/new") return "master.position.create";
  if (/^\/master\/position\/[^/]+\/edit\/?$/.test(pathname)) return "master.position.update";
  if (pathname === "/master/position" || /^\/master\/position\/[^/]+\/?$/.test(pathname)) {
    return "master.position.read";
  }

  // ===== Master lain (kalau nanti punya new/edit, tambahkan pola seperti di Position)
  if (pathname === "/master/bus" || /^\/master\/bus\/[^/]+\/?$/.test(pathname)) {
    return "master.bus.read";
  }
  if (pathname === "/master/bus-type" || /^\/master\/bus-type\/[^/]+\/?$/.test(pathname)) {
    return "master.bus_type.read";
  }
  if (pathname === "/master/employees" || /^\/master\/employees\/[^/]+\/?$/.test(pathname)) {
    return "master.employees.read";
  }
  if (pathname === "/master/customers" || /^\/master\/customers\/[^/]+\/?$/.test(pathname)) {
    return "master.customers.read";
  }

  // tidak perlu guard
  return null;
}

export default async function proxy(req: NextRequest) {
  const { pathname } = new URL(req.url);
  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: ["HS256"] });
    const perms = (payload as any)?.perms as string[] | undefined;

    const required = resolveRequiredPermission(pathname);
    if (!required) return NextResponse.next();

    if (!perms || !Array.isArray(perms)) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
    if (!perms.includes(required)) {
      return NextResponse.redirect(new URL("/403", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
