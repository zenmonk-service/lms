"use client";

import React from "react";
import { Building2, User, Settings, LogOut, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { signOutUser } from "@/app/auth/sign-out.action";
import { getSession } from "@/app/auth/get-auth.action";
import { persistor, useAppDispatch } from "@/store";
import { resetStore } from "@/store/reset-store-action";
import { useRouter } from "next/navigation";

function AppBar() {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const [user, setUser] = React.useState<any>(null);
  async function getAuth() {
    const session = await getSession();
    setUser(session?.user);
  }
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    getAuth();
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 py-4 px-6">
      <div className="mx-auto flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-gray-900">LMS</h1>
            <p className="text-xs">Leave Management System</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-3">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          {/* Profile menu */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center hover:opacity-90 transition">
                <User className="w-4 h-4 text-white" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-56 p-0 backdrop-blur-md bg-white/70 border-0 rounded-xl shadow-lg"
              align="end"
            >
              {/* User info */}
              <div className="px-4 py-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-200/50 mx-2" />

              {/* Actions */}
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-white/40 transition rounded-lg"
                onClick={async () => {
                  startTransition(async () => {
                    dispatch(resetStore());
                    await persistor.purge();
                    await signOutUser();
                    window.location.replace("/");
                  });
                }}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-gray-500" />
                ) : (
                  <LogOut className="w-4 h-4 mr-2 text-gray-500" />
                )}
                Logout
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}

export default AppBar;
