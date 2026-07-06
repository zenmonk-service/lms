import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./app/auth/get-auth.action";

const SUPERADMIN_EMAIL = "superadmin@superadmin.in";

type Permission = { tag: string; action: string };
type Session = Awaited<ReturnType<typeof getSession>>;

// Checks if the user has a permission with the given tag, optionally restricted to specific actions.
function hasPermission(
  session: Session,
  tag: string,
  actions?: string[]
): boolean {
  return !!session?.user?.permissions?.some(
    (perm: Permission) =>
      perm.tag === tag && (!actions || actions.includes(perm.action))
  );
}

// One entry per protected route. `actions` omitted = any action on that tag counts.
const ROUTE_RULES: { suffix: string; tag: string; actions?: string[] }[] = [
  { suffix: "/user-management", tag: "user_management" },
  { suffix: "/details", tag: "user_management", actions: ["read"] },
  { suffix: "/role-management", tag: "role_management" },
  { suffix: "/organization-management", tag: "organization_management" },
  { suffix: "/organization-management/settings", tag: "organization_management" },
  { suffix: "/organization-management/appearance", tag: "organization_management" },
  { suffix: "/attendance", tag: "attendance_management" },
  { suffix: "/my-attendance", tag: "user_attendance_management" },
  { suffix: "/organization-event-management", tag: "organization_event_management" },
  {
    suffix: "/approvals",
    tag: "leave_request_management",
    actions: ["approve"],
  },
  {
    suffix: "/my-leaves",
    tag: "leave_request_management",
    actions: ["create", "read", "update", "delete"],
  },
  {
    suffix: "/leave-types",
    tag: "leave_type_management",
    actions: ["create", "read", "update", "delete"],
  },
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const loggedInUser = await getSession();

  // --- Auth gate ---
  if (!loggedInUser && !pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!loggedInUser) {
    return NextResponse.next();
  }

  const { user } = loggedInUser;

  const isSuperadmin = user.email === SUPERADMIN_EMAIL;

  // --- Superadmin: confined to /organizations ---
  if (isSuperadmin && !pathname.startsWith("/organizations")) {
    return NextResponse.redirect(new URL("/organizations", request.url));
  }
  if (!isSuperadmin && pathname.startsWith("/organizations")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // --- Org-selection gate ---
  if (!isSuperadmin) {
    if (user?.org_uuid && pathname.startsWith("/login")) {
      return NextResponse.redirect(
        new URL(`/${user.org_uuid}/dashboard`, request.url)
      );
    }
    if (!user?.org_uuid && !pathname.startsWith("/select-organization")) {
      return NextResponse.redirect(new URL("/select-organization", request.url));
    }

  }

  // --- Generic per-route permission check ---
  // Sort by suffix length so more specific paths (e.g. ".../settings") are
  // matched before their shorter parent (e.g. "organization-management").
  const rule = [...ROUTE_RULES]
    .sort((a, b) => b.suffix.length - a.suffix.length)
    .find((r) => pathname.endsWith(r.suffix));

  if (rule && !hasPermission(loggedInUser, rule.tag, rule.actions)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/users/:path*",
    "/organizations/:path*",
    "/select-organization",
    "/:org/user-management",
    "/:org/user-management/:user_uuid/details",
    "/:org/role-management",
    "/:org/organization-management",
    "/:org/organization-event-management",
    "/:org/attendance",
    "/:org/my-attendance",
    "/:org/my-leaves",
    "/:org/leave-types",
    "/:org/dashboard",
    "/:org/admin-dashboard",
  ],
};