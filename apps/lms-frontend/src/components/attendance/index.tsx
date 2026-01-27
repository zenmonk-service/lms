"use client";
import { useState, useEffect, useRef } from "react";
import { Users, Search, ChevronRight, Download, Mail } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPagination, UserInterface } from "@/features/user/user.slice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { listUserAction } from "@/features/user/user.action";
import { getUserAttendancesAction } from "@/features/attendances/attendances.action";
import AttendanceTable from "@/components/attendance-table";
import { Button } from "../ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Separator } from "../ui/separator";
import { UserListSkeleton } from "./skeleton";
const Attendance = () => {
  const { users, isLoading } = useAppSelector((state) => state.userSlice);
  const { currentOrganization } = useAppSelector(
    (state) => state.organizationsSlice,
  );
  const userAttendance = useAppSelector(
    (state) => state.attendancesSlice.attendances,
  );
  const userAttendanceLoading = useAppSelector(
    (state) => state.attendancesSlice.loading,
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  const dispatch = useAppDispatch();
  const [selectedEmployee, setSelectedEmployee] =
    useState<UserInterface | null>(null);
  const [debouncedSearch, handleSearchChange] = useState("");
  const [itemsPerPage] = useState<number>(10);
  const [dateRange, setDateRange] = useState<{
    start_date?: string;
    end_date?: string;
  }>({
    start_date: undefined,
    end_date: undefined,
  });
  const totalPages = Math.ceil((userAttendance?.total || 0) / itemsPerPage);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const handleSearchDebounced = (value: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      handleSearchChange(value);
    }, 500);
  };

  useEffect(() => {
    dispatch(setPagination({ page: 1, limit: 50, search: "" }));
  }, []);

  useEffect(() => {
    if (currentOrganization.uuid) {
      dispatch(
        listUserAction({
          org_uuid: currentOrganization.uuid,
          pagination: {
            page: 1,
            limit: 10,
            search: debouncedSearch?.trim(),
          },
        }),
      );
    }
  }, [currentOrganization.uuid, debouncedSearch]);

  useEffect(() => {
    if (selectedEmployee) {
      dispatch(
        getUserAttendancesAction({
          org_uuid: currentOrganization.uuid,
          user_uuid: selectedEmployee?.user_id,
          page: currentPage,
          limit: itemsPerPage,
          ...(dateRange.end_date && { date_range: dateRange }),
        }),
      );
    }
  }, [
    dateRange?.end_date,
    currentPage,
    selectedEmployee?.user_id,
    currentOrganization.uuid,
  ]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-1/2 sm:w-3/4 p-6">
        <div className="mb-4">
          <div className="flex justify-between">
            <h1 className="text-lg font-bold">Attendance Management</h1>
            <Button size={"sm"}>
              <Download size={16} /> Export Report
            </Button>
          </div>
          <p className="text-muted-foreground max-w-80 text-sm">
            Monitor and manage employee attendance across the organization.
          </p>
        </div>

        <div className="flex gap-8">
          <div className="bg-card flex flex-col border border-border rounded-md">
            <div className="p-4">
              <InputGroup>
                <InputGroupInput
                  placeholder="Search..."
                  onChange={(e) => handleSearchDebounced(e.target.value)}
                />
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <Separator />

            <div className="overflow-y-auto max-h-[450px]">
              {isLoading ? (
                <UserListSkeleton />
              ) : (
                users.map((emp: UserInterface) => (
                  <div
                    key={emp.user_id}
                    onClick={() => {
                      setSelectedEmployee(emp);
                    }}
                    className={`w-full flex items-center justify-between p-4 border-b transition-colors group cursor-pointer ${
                      selectedEmployee?.user_id === emp.user_id
                        ? "bg-sidebar-accent/50"
                        : "hover:bg-sidebar"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={emp.image || ""}
                          alt={emp.name}
                          className="object-contain"
                        />
                        <AvatarFallback>
                          {emp.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className={`text-sm font-semibold`}>{emp.name}</p>
                        <div className="flex items-center">
                          <Mail
                            size={12}
                            className="mr-1 text-muted-foreground"
                          />
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {emp.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} />
                  </div>
                ))
              )}
            </div>
          </div>

          <main className="flex-1">
            {selectedEmployee ? (
              <AttendanceTable
                setDateRange={setDateRange}
                userAttendance={userAttendance}
                userAttendanceLoading={userAttendanceLoading}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
                expandedRowId={expandedRowId}
                setExpandedRowId={setExpandedRowId}
                noDataMessage={
                  "We couldn't find any attendance logs for the selected criteria. Try adjusting your date range."
                }
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-primary mb-6">
                  <Users size={32} />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-2">
                  Select an employee
                </h3>
                <p className="text-card-foreground max-w-xs mx-auto">
                  Click on an employee from the list to view their detailed
                  attendance history, statistics, and logs.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
