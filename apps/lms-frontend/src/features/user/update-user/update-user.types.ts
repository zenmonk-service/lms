import { EmploymentType, Gender, GuardianInformation, GuardianRelation, MaritalStatus, ParentInformation, WorkMode } from "../user.type";
export interface UpdateUserPayload {
  name: string;
  role: string;
  image: string;
  email: string;
  shift_uuid: string;
  work_mode: WorkMode;
  work_branch: string;
  employment_type: EmploymentType;
  personal_information: Partial<PersonalInformationInterface>;
}

interface PersonalInformationInterface {
  dob: string;
  gender: Gender;
  phone_number: string;
  current_address: string;
  permanent_address: string;
  marital_status: MaritalStatus;
  parent_information: Partial<ParentInformation>;
  guardian_information: Partial<GuardianInformation>;
}