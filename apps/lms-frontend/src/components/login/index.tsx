"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginCredentials } from "@/types/user";

import { useRouter } from "next/navigation";
import { setCurrentUser, UserInterface } from "@/features/user/user.slice";
import { useAppDispatch } from "@/store";
import { signIn as signInUser, useSession } from "next-auth/react";
import { signIn } from "@/features/user/user.service";
import { toastError } from "@/shared/toast/toast-error";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import {
  getOrganizationByIdAction,
  getOrganizationUserDataAction,
} from "@/features/organizations/organizations.action";
import { setCurrentOrganization } from "@/features/organizations/organizations.slice";

export default function LoginPage({
  organization_uuid,
}: {
  organization_uuid?: string;
}) {
  const path = window.location.pathname;
  const { update } = useSession();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
  };

  const handleForgotPassword = () => {
    const baseURL = process.env.NEXT_PUBLIC_SSO_URL;
    router.push(`${baseURL}/password/forgot`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user: any = await signIn(credentials);
      const userData = user.data.data;
      await signInUser("credentials", {
        redirect: false,
        email: userData.email,
        name: userData.name,
        uuid: userData.user_id,
      });
      await dispatch(setCurrentUser(userData));
      if (userData.role == "superadmin") {
        router.replace("/organizations");
      } else if (path.includes("login/organizations/") && organization_uuid) {
        setLoading(true);
        const userDataResponse = await dispatch(
          getOrganizationUserDataAction({
            organizationId: organization_uuid,
            email: userData.email || "",
          }),
        ).unwrap();

        const normalizedCurrentUser: UserInterface = {
          user_id:
            userDataResponse?.user_id ||
            userDataResponse?.uuid ||
            String(userDataResponse?.id || ""),
          name: userDataResponse?.name || "",
          email: userDataResponse?.email || "",
          role: {
            id: String(userDataResponse?.role?.id || ""),
            uuid: userDataResponse?.role?.uuid || "",
            name: userDataResponse?.role?.name || "",
            description: userDataResponse?.role?.description || "",
          },
          organization_shift: {
            uuid: userDataResponse?.organization_shift?.uuid || "",
            name: userDataResponse?.organization_shift?.name || "",
            start_time: userDataResponse?.organization_shift?.start_time || "",
            end_time: userDataResponse?.organization_shift?.end_time || "",
            effective_hours:
              userDataResponse?.organization_shift?.effective_hours || 0,
          },
          is_active: Boolean(userDataResponse?.is_active),
          created_at: userDataResponse?.created_at || "",
          image: userDataResponse?.image || "",
          documents: userDataResponse?.documents || [],
        };
        const org = await dispatch(
          getOrganizationByIdAction(organization_uuid),
        ).unwrap();
        dispatch(setCurrentOrganization(org));
        dispatch(setCurrentUser(normalizedCurrentUser));
        await update({
          org_uuid: organization_uuid,
          name: normalizedCurrentUser.name,
          email: normalizedCurrentUser.email,
          image: normalizedCurrentUser.image || null,
          role: normalizedCurrentUser.role,
          organization_shift: normalizedCurrentUser.organization_shift,
        });
        setLoading(false);
        router.push(`/${organization_uuid}/dashboard`);
      } else {
        router.replace("/select-organization");
      }
    } catch (err: any) {
      toastError(
        err?.response?.data?.error || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto relative z-10 border-0">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <img
              src="/logo.svg"
              alt="Brand Logo"
              className="w-20 h-20 object-contain drop-shadow-sm bg-card-foreground p-2 rounded-2xl"
            />
          </div>

          <CardTitle className="text-3xl font-bold tracking-wide">
            Welcome
          </CardTitle>
          <CardDescription className="leading-0">
            Sign in to access your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <InputGroup className="h-12 shadow-none">
                <InputGroupInput
                  required
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="name@company.com"
                />
                <InputGroupAddon>
                  <Mail />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="password">Password</Label>
              <InputGroup className="h-12 shadow-none">
                <InputGroupInput
                  required
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
                <InputGroupAddon>
                  <Lock />
                </InputGroupAddon>
                <InputGroupAddon align={"inline-end"}>
                  <Button
                    type="button"
                    size={"icon-sm"}
                    variant={"ghost"}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </InputGroupAddon>
              </InputGroup>
              <button
                className="float-right cursor-pointer mb-2 hover:underline text-primary"
                type="button"
                onClick={handleForgotPassword}
              >
                <p className="text-xs text-primary font-semibold">
                  Forgot password?
                </p>
              </button>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
