"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

function isPathActive(pathname: string, url: string) {
  return pathname === url || pathname.startsWith(`${url}/`);
}

function isItemActive(pathname: string, item: any): boolean {
  if (item.url && isPathActive(pathname, item.url)) return true;
  if (item.items)
    return item.items.some((child: any) => isItemActive(pathname, child));
  return false;
}

export function SidebarNavItem({ item }: { item: any }) {
  const pathname = usePathname();
  const active = isItemActive(pathname, item);
  const [open, setOpen] = useState(true);

  if (item.items) {
    return (
      <SidebarMenuItem className="space-y-1">
        <SidebarMenuButton
          isActive={active}
          onClick={() => setOpen((prev) => !prev)}
        >
          <div className="flex items-center gap-3 w-full">
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="text-sm flex-1 tracking-tight">{item.title}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
            />
          </div>
        </SidebarMenuButton>

        <div
          className={`overflow-hidden transition-[max-height] duration-300 ease-in-out w-full ${
            open ? "max-h-40" : "max-h-0"
          }`}
        >
          <SidebarMenu className="pl-4 w-full">
            {item.items.map((child: any) => (
              <SidebarMenuButton
                key={child.title}
                asChild
                className="w-full"
                isActive={isItemActive(pathname, child)}
              >
                <Link href={child.url}>
                  <child.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{child.title}</span>
                </Link>
              </SidebarMenuButton>
            ))}
          </SidebarMenu>
        </div>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild className="px-2 py-1.5" isActive={active}>
        <Link href={item.url}>
          <item.icon className="w-5 h-5" />
          <span className="text-sm tracking-tight">{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
