import AppBar from "@/components/app-bar";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-svh flex-col">
      <AppBar />

      <main className="flex-1 flex flex-col overflow-y-auto min-h-0">
        {children}
      </main>
    </div>
  );
}
