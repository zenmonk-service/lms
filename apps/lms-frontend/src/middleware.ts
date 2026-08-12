import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./app/auth/get-auth.action";
import { hasPermission, ROUTES } from "./lib/middleware-permission-check";
import { backendClient } from "./config/server";

const SUPERADMIN_EMAIL = "superadmin@superadmin.in";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const session = await getSession();

  // ---------------- Authentication ----------------

  if (!session) {
    if (!pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }

  const user = session.user;
  const isSuperAdmin = user.email === SUPERADMIN_EMAIL;

  // ---------------- Super Admin ----------------

  if (isSuperAdmin) {
    if (!pathname.startsWith("/organizations")) {
      return NextResponse.redirect(new URL("/organizations", request.url));
    }

    return NextResponse.next();
  }

  // ---------------- Organization ----------------

  if (pathname.startsWith("/organizations")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!user.org_uuid) {
    if (!pathname.startsWith("/select-organization")) {
      return NextResponse.redirect(
        new URL("/select-organization", request.url),
      );
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/login")) {
    return NextResponse.redirect(
      new URL(`/${user.org_uuid}/dashboard`, request.url),
    );
  }

  // ---------------- Permission Check ----------------

  const route = ROUTES.find((route) =>
    route.paths.some((path) => pathname.endsWith(path)),
  );

  if (route) {
    const {
      permission: { tag, anyOf, allOf },
    } = route;
    const permissions = await backendClient.get(
      `/roles/${user.role?.uuid!}`,
      {
        headers: {
          org_uuid: user.org_uuid!,
        },
      },
    );


    if (!hasPermission( await permissions.json(), tag, { anyOf, allOf })) {
      return NextResponse.redirect(
        new URL(`/${user.org_uuid}/dashboard`, request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/users/:path*",
    "/organizations/:path*",
    "/select-organization",
    "/:org/dashboard",
    "/:org/user-management",
    "/:org/user-management/:user_uuid/details",
    "/:org/role-management",
    "/:org/organization-management",
    "/:org/organization-management/:path*",
    "/:org/organization-event-management",
    "/:org/my-attendance",
    "/:org/my-leaves",
    "/:org/leave-types",
    "/:org/approvals",
    "/:org/admin-dashboard",
    "/:org/admin-dashboard/leaves",
    "/:org/admin-dashboard/attendance",
    "/:org/admin-dashboard/payroll",
  ],
};
