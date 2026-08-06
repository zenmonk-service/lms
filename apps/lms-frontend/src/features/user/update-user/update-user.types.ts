import { Documents, IFile } from "@/features/leave/leave.types";
import { EmploymentType, Gender, GuardianInformation, GuardianRelation, MaritalStatus, ParentInformation, WorkMode } from "../user.type";
import { DocumentFormData } from "@/components/user/user-detail/user.types";
export interface UpdateUserPayload {
  name: string;
  image?: string | null;
  email: string;
  shift_uuid: string;
  role_uuid: string;
  work_mode: WorkMode;
  work_branch: string;
  employment_type: EmploymentType;
  emp_code: string;
  personal_information: Partial<PersonalInformationInterface>;
  documents: DocumentFormData[];
}

interface PersonalInformationInterface {
  dob: string | null;
  gender: Gender;
  phone_number: string;
  current_address: string;
  permanent_address: string;
  marital_status: MaritalStatus;
  parent_information: Partial<ParentInformation>;
  guardian_information: Partial<GuardianInformation>;
}