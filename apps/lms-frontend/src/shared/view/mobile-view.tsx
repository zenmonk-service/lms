import React from "react";
import { useScreenSize } from "../hooks/use-screen-size";
import { cn } from '@/lib/utils';

interface IProps {
  children: React.ReactNode;
  className?: string;
}

const MobileView = ({ children, className }: IProps) => {
  const { isMobile } = useScreenSize();
  return (
    <div className={cn("block md:hidden", { hidden: !isMobile }, className)}>
      {children}
    </div>
  );
};

export default MobileView;
