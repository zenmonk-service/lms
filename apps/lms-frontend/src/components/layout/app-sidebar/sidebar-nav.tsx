"use client";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { SidebarNavItem } from "./sidebar-nav-item";

interface SidebarNavProps {
  items: any[];
}

export function SidebarNav({ items }: SidebarNavProps) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarNavItem key={item.title} item={item} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
