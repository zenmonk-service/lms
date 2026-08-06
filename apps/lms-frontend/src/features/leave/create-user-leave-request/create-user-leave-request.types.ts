import { IFile } from "../leave.types";

export interface CreateLeaveRequestPayload {
  org_uuid: string;
  user_uuid: string;
  leave_type_uuid: string;
  type: string;
  range: string;
  managers: string[];
  date_range: {
    start_date: string;
    end_date: string;
  };
  reason?: string;
  documents?: Omit<IFile, "uuid" | "created_at" | "updated_at" | "deleted_at">[]; 
}