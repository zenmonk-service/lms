"use client";

import { listOrganizationsAction } from "@/features/organizations/list-organizations/list-organization.action";
import { useAppDispatch, useAppSelector } from "@/store";
import { useEffect } from "react";

interface IProps {
    search?: string;
}

export default function useOrganizationData({ search }: IProps) {
  const dispatch = useAppDispatch();
  const { organizations, isLoading } = useAppSelector((state) => state.organizationsSlice);

  const fetchOrganizations = () => {
    dispatch(listOrganizationsAction({params: { search }}));
  }

  useEffect(() => {
    fetchOrganizations();
  }, [search, dispatch]);

  return { organizations, isLoading, fetchOrganizations };
}
