"use client";

import React from "react";
import { User, LogOut, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { signOutUser } from "@/app/auth/sign-out.action";
import { getSession } from "@/app/auth/get-auth.action";
import { persistor } from "@/store";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/shared/theme-toggle";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

function AppBar() {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const [user, setUser] = React.useState<any>(null);
  async function getAuth() {
    const session = await getSession();
    setUser(session?.user);
  }

  React.useEffect(() => {
    getAuth();
  }, []);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40 py-4 px-6">
      <div className="mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="Brand Logo"
            className="w-10 h-10 object-contain drop-shadow-sm"
          />
        </div>

        <div className="flex items-center">
          <ThemeToggle />

          <Separator orientation="vertical" className="mx-2 h-6!" />

          <Popover>
            <PopoverTrigger asChild>
              <div className="p-2 ml-2 bg-primary rounded-full">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-56 p-0 bg-card rounded-xl shadow-lg border-border"
              align="end"
            >
              <div className="px-4 py-3">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs">{user?.email}</p>
              </div>
              <Separator />
              <div className="p-1">
                <Button
                  variant="ghost"
                  className="w-full inline-flex items-center justify-start text-destructive hover:text-destructive"
                  onClick={async () => {
                    startTransition(async () => {
                      await persistor.purge();
                      await signOutUser();
                      router.replace("/login");
                    });
                  }}
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4 mr-2" />
                  )}
                  Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}

export default AppBar;
