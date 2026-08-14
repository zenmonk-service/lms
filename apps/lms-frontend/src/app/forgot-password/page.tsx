"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, LoaderCircle, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

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
import { useAppDispatch } from "@/store";
import { ForgotPasswordAction } from "@/features/user/forgot-password/forgot-password.action";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMailSent, setIsMailSent] = useState(false);

  const dispatch = useAppDispatch();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const result = await dispatch(ForgotPasswordAction(email)).unwrap();
      setIsMailSent(result?.status);
    } catch (error) {
      console.error("Forgot password failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isMailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Mail className="w-20 h-20 text-primary" />
            </div>

            <CardTitle className="text-3xl font-bold tracking-wide">
              Check your email
            </CardTitle>

            <CardDescription className="leading-5">
              We have sent a password reset link to your email. Please check
              your inbox and follow the instructions to reset your password.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go back
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
            Forgot Password?
          </CardTitle>

          <CardDescription className="leading-5">
            Don&apos;t worry, it happens. Please enter the email address
            associated with your account.
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
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  placeholder="name@company.com"
                  autoComplete="email"
                />

                <InputGroupAddon>
                  <Mail />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12">
              {loading ? (
                <div className="flex items-center gap-2">
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                  Sending...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Submit
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4" />
              Go back
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
