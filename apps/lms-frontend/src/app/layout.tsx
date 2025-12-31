import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/store/store-provider";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/themes/theme-provider";
export const metadata: Metadata = {
  title: "Leave Management System",
  description: "Manage your leaves effectively",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body className={`antialiased overflow-hidden`}>
        <SessionProvider>
          <StoreProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </StoreProvider>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
