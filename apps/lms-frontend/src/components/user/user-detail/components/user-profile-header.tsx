"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Loader2, Save, X, Shield } from "lucide-react";

interface UserProfileHeaderProps {
  readonly userInitials: string;
  readonly displayedProfileImage: string;
  readonly userName: string;
  readonly userEmail: string;
  readonly userRole: string;
  readonly isActive: boolean;
  readonly isEditing: boolean;
  readonly isSaving: boolean;
  readonly onEditClick: () => void;
  readonly onSaveClick: () => void;
  readonly onCancelClick: () => void;
  readonly onProfileImageClick: () => void;
  readonly onRemoveImageClick: () => void;
  readonly canRemoveImage: boolean;
  readonly canEdit: boolean;
}

export default function UserProfileHeader({
  userInitials,
  displayedProfileImage,
  userName,
  userEmail,
  userRole,
  isActive,
  isEditing,
  isSaving,
  onEditClick,
  onSaveClick,
  onCancelClick,
  onProfileImageClick,
  onRemoveImageClick,
  canRemoveImage,
  canEdit,
}: Readonly<UserProfileHeaderProps>) {
  return (
    <div className="rounded-lg border border-border p-7 bg-card">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar
              className={`h-24 w-24 rounded-2xl transition-all duration-300 ${
                isEditing ? "cursor-pointer" : ""
              }`}
              onClick={onProfileImageClick}
            >
              <AvatarImage
                src={displayedProfileImage}
                alt={userName}
                className="object-cover"
              />
              <AvatarFallback className="text-lg font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>

            {isEditing && canRemoveImage && (
              <Button
                type="button"
                variant="destructive"
                className="absolute -right-1 -top-1 size-5 rounded-full p-0"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemoveImageClick();
                }}
              >
                <X className="h-2.5 w-2.5" />
              </Button>
            )}
          </div>

          <div className="space-y-1">
            <div>
              <h1
                className="text-2xl md:text-3xl font-bold leading-none"
                style={{ wordBreak: "break-word" }}
              >
                {userName}
              </h1>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
            {isEditing && (
              <p className="text-xs text-muted-foreground italic">
                💡 Click profile image to upload a new photo
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                <Shield />
                {userRole || "No role"}
              </Badge>
              <Badge variant={isActive ? "success" : "destructive"}>
                {isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={onCancelClick}>
                Cancel
              </Button>
              <Button
                variant={"default"}
                onClick={onSaveClick}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Save />
                )}
                Save changes
              </Button>
            </>
          ) : (
            canEdit && (
              <Button variant="default" onClick={onEditClick}>
                <Pencil />
                Edit profile
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
