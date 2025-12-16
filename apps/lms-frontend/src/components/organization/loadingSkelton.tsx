import React from "react";
import { Skeleton } from "../ui/skeleton";

export default function LoadingSkelton() {
  return (
    <>
      <Skeleton className="h-[200px] w-[300px] rounded-xl bg-slate-300" />
      <Skeleton className="h-[200px] w-[300px] rounded-xl bg-slate-300" />
      <Skeleton className="h-[200px] w-[300px] rounded-xl bg-slate-300" />
      <Skeleton className="h-[200px] w-[300px] rounded-xl bg-slate-300" />
      <Skeleton className="h-[200px] w-[300px]  rounded-xl bg-slate-300" />
      <Skeleton className="h-[200px] w-[300px] rounded-xl bg-slate-300" />
    </>
  );
}
