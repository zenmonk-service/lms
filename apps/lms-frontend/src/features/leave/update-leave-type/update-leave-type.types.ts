import { DeepPartial } from "react-hook-form";
import { CreateLeaveTypePayload } from "../create-leave-type/create-leave-type.types";

export interface UpdateLeaveTypePayload extends DeepPartial<CreateLeaveTypePayload> {
    uuid: string;
}