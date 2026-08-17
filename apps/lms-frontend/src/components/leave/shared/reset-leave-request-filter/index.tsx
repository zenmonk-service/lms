"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import { resetLeaveRequestFilter } from "@/features/leave/leave.slice";
import { useAppDispatch } from "@/store";

interface IProps {
  children: ReactNode;
}

const ResetLeaveRequestFilter = ({ children }: IProps) => {
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    dispatch(resetLeaveRequestFilter());
    setReady(true);
  }, [dispatch]);

  if (!ready) return null;

  return children;
};

export default ResetLeaveRequestFilter;