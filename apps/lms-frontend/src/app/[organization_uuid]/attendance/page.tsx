"use client"
import React, { useState, useMemo, useEffect, use, useRef } from 'react';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search, 
  ChevronRight,
  TrendingUp,
  Download,
  MoreVertical,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Mail,
  Briefcase,
  User
} from 'lucide-react';
import { AttendanceStatus } from '@/features/attendances/attendances.type';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPagination, UserInterface } from '@/features/user/user.slice';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { listUserAction } from '@/features/user/user.action';
import { getUserAttendancesAction } from '@/features/attendances/attendances.action';
import AttendanceTable from '@/components/attendance-table';



const App = () => {
    const { users,  isLoading, total, pagination, currentUser } = useAppSelector(
      (state) => state.userSlice
    );
      const { currentOrganization } = useAppSelector(
        (state) => state.organizationsSlice
      );
  const userAttendance = useAppSelector((state) => state.attendancesSlice.attendances);
  const userAttendanceLoading = useAppSelector((state) => state.attendancesSlice.loading);
    const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);


  const dispatch = useAppDispatch();
  const [selectedEmployee, setSelectedEmployee] = useState<UserInterface | null>(null);
  const [debouncedSearch, handleSearchChange] = useState('');
  const [itemsPerPage] = useState<number>(10);
  const [dateRange , setDateRange] = useState<{start_date?: string; end_date?: string}>({
  start_date : undefined,
  end_date : undefined
  });
  const totalPages = Math.ceil((userAttendance?.total || 0) / itemsPerPage);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  function changeUTCtoLocalTime(utcTime: string) {  
    if(!utcTime) return '---';
    
    let date: Date;
    
    // Check if it's just a time string (HH:MM:SS format)
    if (/^\d{2}:\d{2}:\d{2}$/.test(utcTime)) {
      // Create a UTC date with today's date and the provided time
      const now = new Date();
      const [hours, minutes, seconds] = utcTime.split(':').map(Number);
      date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hours, minutes, seconds));
    } else {
      // Parse as full date-time string
      date = new Date(utcTime);
    }
    
    // Check if the date is invalid
    if(isNaN(date.getTime())) return '---';
    
    // Convert UTC to local time
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    const handleSearchDebounced = (value: string) => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
  
      searchTimeout.current = setTimeout(() => {
        handleSearchChange(value);
      }, 500);
    };
  // Filtered employees list
  const getStatusBadge = (status: string) => {
    const base = "px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit";
    switch (status) {
      case AttendanceStatus.PRESENT: 
        return <span className={`${base} text-emerald-700 bg-emerald-50 border border-emerald-100`}><CheckCircle2 size={12}/> {status}</span>;
      case AttendanceStatus.ON_LEAVE: 
        return <span className={`${base} text-amber-700 bg-amber-50 border border-amber-100`}><AlertCircle size={12}/> {status}</span>;
      case AttendanceStatus.ABSENT: 
        return <span className={`${base} text-rose-700 bg-rose-50 border border-rose-100`}><XCircle size={12}/> {status}</span>;
      default: 
        return <span className={`${base} text-slate-700 bg-slate-50 border border-slate-100`}>{status}</span>;
    }
  };





  useEffect(() => {
    dispatch(setPagination({ page :1 , limit: 50 , search : ''}));
  },[]);

useEffect(() => {
   if( currentOrganization.uuid ){
    dispatch( 
        listUserAction({
          org_uuid: currentOrganization.uuid,
          pagination: {
            page: 1,
            limit:10,
            search: debouncedSearch?.trim(),
          },
        })
      );
  }
  
    } , [ currentOrganization.uuid, debouncedSearch]);

  useEffect(() => {
    if (selectedEmployee) {
      dispatch(getUserAttendancesAction({ org_uuid :currentOrganization.uuid, user_uuid :selectedEmployee?.user_id, page: currentPage, limit: itemsPerPage, ...(dateRange.end_date && { date_range: dateRange }) }));
    }
  }, [dateRange?.end_date, currentPage ,selectedEmployee?.user_id, currentOrganization.uuid]);

     function getPercentage(partialValue: number, totalValue: number) { 
    if (totalValue === 0) return 0;
    return (partialValue / totalValue) * 100;
     }


  return (
    <div className="min-h-[calc(100vh-45px)] bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Attendance Management</h1>
            <p className="text-slate-500">Monitor and manage employee attendance across the organization.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
              <Download size={16} /> Export Report
            </button>
          </div>
        </header>

        {(
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Users className="text-blue-600" />} label="Total Employees" value="124" trend="+4%" />
            <StatCard icon={<CheckCircle className="text-emerald-600" />} label="On Time Today" value="92%" trend="+2%" />
            <StatCard icon={<Clock className="text-amber-600" />} label="Late Arrivals" value="8" trend="-12%" />
            <StatCard icon={<XCircle className="text-rose-600" />} label="Absent" value="3" trend="0%" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar: Employee List */}
          <aside className={`${selectedEmployee ? 'hidden lg:block' : 'block'} lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-fit`}>
            <div className="p-4 border-b border-slate-100">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search name or ID..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  onChange={(e) => handleSearchDebounced(e.target.value)}
                />
              </div>
        
            </div>

            <div className="overflow-y-auto max-h-[450px]">
              { isLoading ? <>
                <div className="p-4 space-y-3">
                  {[1,2,3,4,5].map((skeleton) => (
                    <div key={skeleton} className="animate-pulse flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </> : users.map((emp :UserInterface) => (
                <button
                  key={emp.user_id}
                  onClick={() =>{ setSelectedEmployee(emp) ;     
                      
                   }}
                  className={`w-full flex items-center justify-between p-4 border-b border-slate-50 last:border-0 hover:bg-blue-50/50 transition-colors group cursor-pointer${
                    selectedEmployee?.user_id === emp.user_id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                          <div >
              <Avatar className="h-10 w-10 border-2 border-orange-100">
                <AvatarImage 
                  src={emp.image || ""} 
                  alt={emp.name}
                  className="object-contain"
                />
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white font-semibold">
                  {    emp.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
          }
                </AvatarFallback>
              </Avatar>
            </div>
                    <div className="text-left">
                      <p className={`text-sm font-semibold ${selectedEmployee?.user_id === emp.user_id ? 'text-blue-700' : 'text-slate-900'}`}>
                        {emp.name}
                      </p>
                      <p className="text-xs text-slate-500">{emp.email}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className={`text-slate-300 group-hover:text-blue-400 transition-transform ${selectedEmployee?.user_id === emp.user_id ? 'translate-x-1 text-blue-500' : ''}`} />
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content: Detailed View */}
          <main className={`${!selectedEmployee ? 'hidden lg:flex' : 'flex'} lg:col-span-8 flex-col gap-6`}>
            {selectedEmployee ? (
              <>
                {/* Employee Profile Header (Mobile Back Button) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <button 
                    onClick={() => setSelectedEmployee(null)}
                    className="lg:hidden flex items-center gap-2 text-blue-600 font-medium mb-4 text-sm"
                  >
                    <ArrowLeft size={16} /> Back to list
                  </button>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                       <div >
              <Avatar className="h-10 w-10 border-2 border-orange-100">
                <AvatarImage 
                  src={selectedEmployee.image} 
                  alt={selectedEmployee.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white font-semibold">
                  {    selectedEmployee.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
          }
                </AvatarFallback>
              </Avatar>
            </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">{selectedEmployee.name}</h2>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                            <Mail size={14} className="text-blue-600" />
                            <span className="text-xs font-semibold text-blue-700">{selectedEmployee.email}</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-100">
                            <Briefcase size={14} className="text-purple-600" />
                            <span className="text-xs font-semibold text-purple-700">{selectedEmployee.role.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Present Rate</p>
                        <p className="text-lg font-bold text-emerald-600">{getPercentage(userAttendance.total_present_current_month, userAttendance.total_present_current_month + userAttendance.total_absent_current_month)}%</p>
                      </div>
                      <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Days</p>
                        <p className="text-lg font-bold text-slate-700">{`${userAttendance.total_present_current_month} / ${userAttendance.total_absent_current_month + userAttendance.total_present_current_month} `}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendance Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                     <AttendanceTable  setDateRange={setDateRange} 
                           userAttendance={userAttendance} 
                           userAttendanceLoading={userAttendanceLoading} 
                           currentPage={currentPage} 
                           itemsPerPage={itemsPerPage} 
                           totalPages={totalPages} 
                           handlePageChange={handlePageChange} 
                           changeUTCtoLocalTime={changeUTCtoLocalTime} 
                           getStatusBadge={getStatusBadge} 
                           expandedRowId={expandedRowId} 
                           setExpandedRowId={setExpandedRowId} />
             
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-6">
                  <Users size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Select an employee</h3>
                <p className="text-slate-500 max-w-xs mx-auto">
                  Click on an employee from the list to view their detailed attendance history, statistics, and logs.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

// Sub-component for stats
const StatCard = ({ icon, label, value, trend } :any) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <div className="p-2.5 bg-slate-50 rounded-xl">
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
        trend.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
      }`}>
        <TrendingUp size={12} /> {trend}
      </div>
    </div>
    <p className="text-slate-500 text-sm font-medium">{label}</p>
    <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
  </div>
);

export default App;