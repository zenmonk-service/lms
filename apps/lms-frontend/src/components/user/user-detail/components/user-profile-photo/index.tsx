"use client";

import { useRef } from "react";
import { useSession } from "next-auth/react";
import { ImageIcon, Loader2Icon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/store";
import { imageUploadAction } from "@/features/image-upload/image-upload.action";
import { updateUserAction } from "@/features/user/update-user/update-user.action";
import { getOrganizationUserAction } from "@/features/user/get-organization-user/get-organization-user.action";
import { setCurrentUser } from "@/features/user/user.slice";
import { getInitials } from "@/utils/get-initials";

export default function UserProfilePhoto({
  organizationUuid,
  userUuid,
  userName,
  userEmail,
  userRole,
  isActive,
}: {
  organizationUuid: string;
  userUuid: string;
  userName: string;
  userEmail: string;
  userRole: string;
  isActive: boolean;
}) {
  const dispatch = useAppDispatch();
  const { update } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);

  const { currentUser, selectedUser } = useAppSelector((state) => state.userSlice);
  const { isLoading: isImgLoading } = useAppSelector((state) => state.imageUploadSlice);

  const userInitials = userName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadResult: any = await dispatch(imageUploadAction(formData));
      const { success, url } = uploadResult.payload;
      if (!success) throw new Error("Image upload failed");

      await dispatch(updateUserAction({ user_uuid: userUuid, org_uuid: organizationUuid, image: url }));
      await dispatch(getOrganizationUserAction({ org_uuid: organizationUuid, user_uuid: userUuid }));

      if (currentUser?.user_id === userUuid) {
        dispatch(setCurrentUser({ ...currentUser, image: url }));
        await update({ image: url });
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        className="relative cursor-pointer"
        onClick={() => inputRef.current?.click()}
        disabled={isImgLoading}
      >
        <Avatar className="h-16 w-16 group">
          <AvatarImage src={selectedUser?.image || ""} alt={userName} className="object-cover" />
          <AvatarFallback>{getInitials(userName)}</AvatarFallback>
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
            <ImageIcon className="text-white" size={16} />
          </div>
          {isImgLoading && (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
              <Loader2Icon className="text-white animate-spin" size={16} />
            </div>
          )}
        </Avatar>
      </button>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <div>
        <h2 className="text-xl font-bold">{userName}</h2>
        <p className="text-sm text-muted-foreground">{userEmail}</p>
        <div className="flex gap-2 mt-1">
          <Badge variant="secondary">{userRole}</Badge>
          <Badge variant={isActive ? "success" : "destructive"}>{isActive ? "Active" : "Inactive"}</Badge>
        </div>
      </div>
    </div>
  );
}