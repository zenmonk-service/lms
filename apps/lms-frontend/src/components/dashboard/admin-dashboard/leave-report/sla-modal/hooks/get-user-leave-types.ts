import { listLeaveTypesAction } from "@/features/leave/list-leave-types/list-leave-types.action";
import { useAppDispatch, useAppSelector } from "@/store";
import { useEffect, useState } from "react";

interface IParams {
    org_uuid: string;
    user_uuid?: string;
}

export default function getUserLeaveTypes(params: IParams) {
    const dispatch = useAppDispatch();
    const { leaveTypes } = useAppSelector((state) => state.leaveSlice);
    const [isLoading, setIsLoading] = useState(false);

    const fetchUserLeaveTypes = async (org_uuid: string, user_uuid: string) => {
        setIsLoading(true);
        await dispatch(listLeaveTypesAction({org_uuid, params: { user_uuid }}));
        setIsLoading(false);
    }

    useEffect(() => {
        const { org_uuid, user_uuid } = params;
        if(!user_uuid) return;
        fetchUserLeaveTypes(org_uuid, user_uuid);
    }, [params.org_uuid, params.user_uuid]);
    
    return { isLoading, leaveTypes, fetchUserLeaveTypes };
}