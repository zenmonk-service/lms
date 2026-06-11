"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LoaderCircle,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarFooter,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAppSelector } from "@/store";
import { persistor } from "@/store/store";
import { signOutUser } from "@/app/auth/sign-out.action";
import { useResetTheme } from "@/hooks/use-reset-theme";

export function SidebarUserMenu() {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const resetTheme = useResetTheme();
  const [isPending, startTransition] = useTransition();

  const { currentUser } = useAppSelector((state) => state.userSlice);

  const handleLogout = () => {
    startTransition(async () => {
      resetTheme();
      await persistor.purge();
      await signOutUser();
      router.replace("/login");
    });
  };

  return (
    <SidebarFooter>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar className="rounded-full">
              <AvatarImage
                className="h-full w-full object-cover"
                src={currentUser?.image || "https://github.com/shadcn.png"}
                alt={currentUser?.name || "User Avatar"}
              />
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{currentUser?.name}</span>
              <span className="truncate text-xs">{currentUser?.email}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          side={isMobile ? "bottom" : "right"}
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="rounded-full">
                <AvatarImage
                  className="h-full w-full object-cover"
                  src={currentUser?.image || "https://github.com/shadcn.png"}
                  alt={currentUser?.name || "User Avatar"}
                />
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {currentUser?.name}
                </span>
                <span className="truncate text-xs">{currentUser?.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem>
              <BadgeCheck className="h-4 w-4 mr-2" />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleLogout}>
            {isPending ? (
              <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4 mr-2" />
            )}
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>
  );
}
