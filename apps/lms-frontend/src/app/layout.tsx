import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/store/store-provider";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
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
      <body className={`antialiased`}>
        <link rel="icon" href="/favicon.svg" />
        <SessionProvider>
          <StoreProvider>{children}</StoreProvider>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
