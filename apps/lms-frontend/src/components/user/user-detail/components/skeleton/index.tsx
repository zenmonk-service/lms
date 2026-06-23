"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function UserDetailSkeleton() {
  return (
    <div className="w-11/12 min-[1400px]:w-3/4 mx-auto px-6 pb-6">
      {/* Header */}
      <div className="flex justify-between px-4 border-b border-border pb-2 pt-6 sticky top-0 bg-background z-10">
        <Skeleton className="h-5 w-12" />

        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      {/* Main Card */}
      <div className="space-y-4 mt-4 py-4 border border-border p-4 rounded-lg bg-card">
        {/* User Profile Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="size-20 rounded-full" />

            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          <Skeleton className="h-10 w-24" />
        </div>

        {/* Tabs Layout */}
        <div className="flex flex-row-reverse gap-4">
          {/* Side Tabs */}
          <div className="w-64 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Form Content */}
          <Card className="flex-1 shadow-none rounded-lg py-4 px-6 bg-background">
            <div className="space-y-8">
              {/* Basic Details */}
              <div>
                <Skeleton className="h-6 w-40 mb-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Employment Details */}
              <div>
                <Skeleton className="h-6 w-48 mb-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}