import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { imageUploadAction } from "@/features/image-upload/image-upload.action";
import {
  getOrganizationByIdAction,
  updateOrganizationAction,
} from "@/features/organizations/organizations.action";
import { useAppDispatch, useAppSelector } from "@/store";
import { Globe, ImageIcon, Loader2Icon, Lock } from "lucide-react";
import { useRef } from "react";

interface IdentityBrandingProps {
  org_name: string;
  domain: string;
  logo_url: string | null;
}

const IdentityBranding = ({
  org_name,
  domain,
  logo_url,
}: IdentityBrandingProps) => {
  const { isLoading: isImgLoading } = useAppSelector(
    (state) => state.imageUploadSlice
  );
  const { isOrgUpdating } = useAppSelector(
    (state) => state.organizationsSlice
  );

  const { currentOrganization } = useAppSelector(
    (state) => state.organizationsSlice
  );
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const image = new FormData();
      image.append("file", file);
      try {
        const res = await dispatch(imageUploadAction(image));
        const { success, url } = res.payload;
        if (!success) {
          throw new Error("Image upload failed");
        }
        await dispatch(
          updateOrganizationAction({
            organizationId: currentOrganization.uuid,
            organizationInfo: {
              logo_url: url,
            },
          })
        );
        await dispatch(getOrganizationByIdAction(currentOrganization.uuid));
      } catch (error) {
        console.error("Error uploading image or updating organization:", error);
      }
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold">Identity & Branding</h1>
        <p className="text-sm text-muted-foreground">
          View your workspace details and manage branding assets or domains.
        </p>
      </div>

      <div className="flex gap-6">
        <button
          type="button"
          className="cursor-pointer relative"
          onClick={handleClick}
          disabled={isImgLoading}
        >
          <Avatar className="w-32 h-32 rounded-none transition-all group">
            <AvatarImage
              src={logo_url || "https://github.com/shadcn.png"}
              alt={`Logo of ${org_name}`}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
              <ImageIcon className="text-white" size={20} />
            </div>
            {(isImgLoading || isOrgUpdating) && (
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center transition-all">
                <Loader2Icon className="text-white animate-spin" size={20} />
              </div>
            )}
          </Avatar>
        </button>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h2 className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
              Workspace Name
            </h2>
            <div className="flex items-center justify-between border-b border-border">
              <p className="text-xl font-semibold">{org_name}</p>
              <Lock
                className="text-muted-foreground w-4 h-4"
                strokeWidth={2.5}
              />
            </div>
          </div>

          <div>
            <h2 className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
              Domain
            </h2>
            <InputGroup className="rounded-none border-0 border-b border-border shadow-none">
              <InputGroupAddon align={"inline-start"} className="pl-0">
                <Globe
                  className="w-3 h-3 text-muted-foreground"
                  strokeWidth={2}
                />
              </InputGroupAddon>
              <InputGroupInput value={domain} disabled />
            </InputGroup>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentityBranding;
