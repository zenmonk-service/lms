import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./app/auth/get-auth.action";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const loggedInUser = await getSession();

  if (!loggedInUser && !request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (loggedInUser && loggedInUser.user.email === "superadmin@superadmin.in" && !request.nextUrl.pathname.startsWith("/organizations")) {
    return NextResponse.redirect(new URL("/organizations", request.url));
  }

  if (
    loggedInUser &&
    loggedInUser.user.org_uuid &&
    loggedInUser.user.email !== "superadmin@superadmin.in" &&
    request.nextUrl.pathname.startsWith(`/login`)
  ) {
    return NextResponse.redirect(
      new URL(`/${loggedInUser.user.org_uuid}/dashboard`, request.url)
    );
  }

  if (
    loggedInUser &&
    !loggedInUser.user.org_uuid &&
    loggedInUser.user.email !== "superadmin@superadmin.in" &&
    !request.nextUrl.pathname.startsWith(`/select-organization`)
  ) {
    return NextResponse.redirect(new URL(`/select-organization`, request.url));
  }

  async function hasPagePermission(tag: string) {
    return (await getSession())?.user?.permissions?.some(
      (perm) => perm.tag === tag
    );
  }

  async function isApprovalPageAccessible() {
    return (
      (await hasPagePermission("leave_request_management")) &&
      loggedInUser?.user?.permissions?.some(
        (perm) =>
          perm.tag === "leave_request_management" && perm.action === "approve"
      )
    );
  }

  async function isMyLeavePageAccessible() {
    return (
      (await hasPagePermission("leave_request_management")) &&
      loggedInUser?.user?.permissions?.some(
        (perm) =>
          (perm.tag === "leave_request_management" &&
            perm.action === "create") ||
          perm.action === "read" ||
          perm.action === "update" ||
          perm.action === "delete"
      )
    );
  }

  async function isMyLeaveTypePageAccessible() {
    return (
      (await hasPagePermission("leave_type_management")) &&
      loggedInUser?.user?.permissions?.some(
        (perm) =>
          (perm.tag === "leave_type_management" && perm.action === "create") ||
          perm.action === "read" ||
          perm.action === "update" ||
          perm.action === "delete"
      )
    );
  }

  if (
    loggedInUser &&
    loggedInUser.user.email !== "superadmin@superadmin.in" &&
    request.nextUrl.pathname.startsWith("/organizations")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    !(await hasPagePermission("user_management")) &&
    request.nextUrl.pathname.endsWith("/user-management")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    !(await hasPagePermission("role_management")) &&
    request.nextUrl.pathname.endsWith("/role-management")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (
    !(await isApprovalPageAccessible()) &&
    request.nextUrl.pathname.endsWith("/approvals")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (
    !(await isMyLeaveTypePageAccessible()) &&
    request.nextUrl.pathname.endsWith("/leave-types")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    !(await isMyLeavePageAccessible()) &&
    request.nextUrl.pathname.endsWith("/my-leaves")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/login",
    "/users/:path*",
    "/organizations/:path*",
    "/select-organization",
    "/:org/user-management",
    "/:org/role-management",
    "/:org/my-leaves",
    "/:org/leave-types",
    "/:org/dashboard",
  ],
};
