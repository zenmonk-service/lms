export interface ListMissingAttendancesPayload {
    org_uuid: string;
    params: {
        month: number;
        year: number;
    }
}