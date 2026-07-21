import React from "react";
import { useScreenSize } from "../hooks/use-screen-size";
import { cn } from "@/lib/utils";

interface IProps {
  children: React.ReactNode;
  className?: string;
}

const DesktopView = ({ children, className }: IProps) => {
  const { isDesktop } = useScreenSize();
  return (
    <div className={cn("hidden md:block", { block: isDesktop }, className)}>
      {children}
    </div>
  );
};

export default DesktopView;
