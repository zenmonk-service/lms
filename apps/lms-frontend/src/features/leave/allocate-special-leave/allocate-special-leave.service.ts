import axiosInterceptorInstance from "@/config/axios";
import { AllocateSpecialLeave } from "./allocate-special-leave.type";

export const allocateSpecialLeave = (payload: AllocateSpecialLeave) => {
  const {
    org_uuid,
    leave_uuid,
    allocated_balance,
    allocator_uuid,
    employee_uuid,


  } = payload;

  return axiosInterceptorInstance.put(
    `/organizations/leave-types/${leave_uuid}/sla`,
    {
      allocated_balance,
      allocator_uuid,
      employee_uuid,
    },
    {
      headers: {
        org_uuid,
      },
    },
  );
};