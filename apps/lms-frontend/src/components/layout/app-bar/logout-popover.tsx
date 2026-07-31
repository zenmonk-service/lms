import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTransition } from "react";
import { signOutUser } from "@/app/auth/sign-out.action";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LoaderCircle, LogOut } from "lucide-react";
import { persistor, useAppSelector } from "@/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/get-initials";

const LogoutPopover = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { currentUser: user } = useAppSelector((state) => state.userSlice);

  const handleLogout = async () => {
    startTransition(async () => {
      await persistor.purge();
      await signOutUser();
      router.replace("/login");
    });
  };

  return (
    <Popover>
      <PopoverTrigger className="cursor-pointer ml-1">
        <Avatar className="w-8 h-8">
          <AvatarImage
            src={user.image || ""}
            alt={user.name}
            className="h-full w-full object-cover"
          />
          <AvatarFallback className="text-sm font-medium">{getInitials(user.name)}</AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 p-0 bg-card rounded-xl shadow-lg border-border"
        align="end"
      >
        <div className="px-4 py-3">
          <p className="text-sm font-medium truncate">{user?.name}</p>
          <p className="text-xs">{user?.email}</p>
        </div>
        <Separator />
        <div className="p-1">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-start"
          >
            {isPending ? <LoaderCircle className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
            Logout
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LogoutPopover;
