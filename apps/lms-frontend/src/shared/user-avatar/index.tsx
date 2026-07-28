import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/get-initials";

interface IProps<T extends { name: string; email: string; image?: string }> {
  user: T;
}

const UserAvatar = <T extends { name: string; email: string; image?: string }>({
  user,
}: IProps<T>) => {
  return (
    <div className="flex gap-2">
      <Avatar className="rounded-full border border-border">
        <AvatarImage
          src={user.image || ""}
          alt={user.name}
          className="h-full w-full object-cover"
        />
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-medium">{user.name}</span>
        <span className="text-xs text-muted-foreground">{user.email}</span>
      </div>
    </div>
  );
};

export default UserAvatar;