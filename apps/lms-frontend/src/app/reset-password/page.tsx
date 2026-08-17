"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useAppDispatch } from "@/store/hooks";
import { resetPasswordAction } from "@/features/user/reset-password/reset-password.action";
import { isResetLinkValidAction } from "@/features/user/reset-valid-link/reset-valid-link.action";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const passwordRules = [
  {
    label: "At least 8 characters",
    test: (password: string) => password.length >= 8,
  },
  {
    label: "One uppercase letter",
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    label: "One lowercase letter",
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    label: "One number",
    test: (password: string) => /[0-9]/.test(password),
  },
  {
    label: "One special character",
    test: (password: string) => /[^A-Za-z0-9]/.test(password),
  },
];

export default function ResetPasswordPage() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isValidLink, setIsValidLink] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!uid || !token) return;

    setLoading(true);

    try {
      const response = await dispatch(
        resetPasswordAction({
          password: data.password,
          uid,
          token,
        }),
      ).unwrap();

      if (response?.status === true) {
        setSuccess(true);
      }
    } catch {
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uid) {
      const response = dispatch(isResetLinkValidAction(uid)).unwrap();
      response
        .then((res) => {
          if (res?.status === true) {
            setIsValidLink(true);
          } else {
            setIsValidLink(false);
          }
        })
        .catch((err) => {
          setIsValidLink(false);
        });
    }
  }, [uid]);

  if (!uid || !isValidLink || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <X className="w-10 h-10 text-destructive" />
              </div>
            </div>

            <CardTitle className="text-3xl font-bold tracking-wide">
              Invalid Reset Link
            </CardTitle>

            <CardDescription className="leading-5">
              This password reset link is invalid or incomplete. Please request
              a new password reset link.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => router.push("/forgot-password")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Request new link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-10 h-10 text-primary" />
              </div>
            </div>

            <CardTitle className="text-3xl font-bold tracking-wide">
              Password Reset
            </CardTitle>

            <CardDescription className="leading-5">
              Your password has been successfully reset. You can now log in with
              your new password.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button
              type="button"
              className="w-full h-12"
              onClick={() => router.push("/login")}
            >
              Go to Login
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/logo.svg"
              alt="Zenmonk logo"
              className="w-20 h-20 object-contain drop-shadow-sm bg-card-foreground p-2 rounded-2xl"
            />
          </div>

          <CardTitle className="text-3xl font-bold tracking-wide">
            Reset Password
          </CardTitle>

          <CardDescription className="leading-5">
            Create a strong new password for your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>

              <InputGroup className="h-12 shadow-none">
                <InputGroupInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  {...register("password")}
                />

                <InputGroupAddon>
                  <Lock />
                </InputGroupAddon>

                <InputGroupAddon
                  align="inline-end"
                  className="cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </InputGroupAddon>
              </InputGroup>

              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Password requirements */}
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <p className="text-sm font-medium mb-2">Password requirements</p>

              {passwordRules.map((rule) => {
                const valid = rule.test(password || "");

                return (
                  <div
                    key={rule.label}
                    className="flex items-center gap-2 text-sm"
                  >
                    {valid ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground" />
                    )}

                    <span
                      className={
                        valid ? "text-primary" : "text-muted-foreground"
                      }
                    >
                      {rule.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>

              <InputGroup className="h-12 shadow-none">
                <InputGroupInput
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                />

                <InputGroupAddon>
                  <Lock />
                </InputGroupAddon>

                <InputGroupAddon
                  align="inline-end"
                  className="cursor-pointer"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </InputGroupAddon>
              </InputGroup>

              {errors.confirmPassword ? (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              ) : (
                confirmPassword &&
                password === confirmPassword && (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Check className="w-4 h-4" />
                    Passwords match
                  </div>
                )
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12">
              {loading ? (
                "Resetting..."
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Reset Password
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => router.push("/login")}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
