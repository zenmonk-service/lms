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
import { setCurrentUser } from "@/features/user/user.slice";
import { useAppDispatch } from "@/store";
import { signIn as signInUser } from "next-auth/react";
import { signIn } from "@/features/user/user.service";
import { toastError } from "@/shared/toast/toast-error";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";

export default function LoginPage() {
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
      } else {
        router.replace("/select-organization");
      }
    } catch (err: any) {
      toastError(
        err?.response?.data?.error || "Something went wrong. Please try again."
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
