"use client";
import FaceDetection from "@/components/face-detection/face-detection";
import { ConfirmationDialog } from "@/shared/confirmation-dialog";
import React, { useState, useEffect,  useMemo } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  LogOut,
  ArrowRightLeft,
  Download,
  Camera,
  X,
  Keyboard,
  Loader2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from "@/store";
import { checkInAction, checkOutAction, getUserAttendancesAction, getUserTodayAttendancesAction } from "@/features/attendances/attendances.action";
import { AttendanceStatus } from "@/features/attendances/attendances.type";
import { OrgAttendanceMethod } from "@/features/organizations/organizations.type";
import AttendanceTable from "@/components/attendance-table";

type AttendanceMode = 'manual' | 'camera' | null;


const App = () => {
  const dispatch =  useAppDispatch();
  const orgUUID = useAppSelector(state => state.organizationsSlice.currentOrganization.uuid);
  const userUUID = useAppSelector((state) => state.userSlice.currentUser?.user_id);
  const organizationSettings = useAppSelector((state) => state.organizationsSlice.organizationSettings);
  const userTodayAttendance = useAppSelector((state) => state.attendancesSlice.attendance);
  const userAttendance = useAppSelector((state) => state.attendancesSlice.attendances);
  const userAttendanceLoading = useAppSelector((state) => state.attendancesSlice.loading);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [attendanceMode, setAttendanceMode] = useState<AttendanceMode>(null);
  const [isCheckedIn, setIsCheckedIn] = useState<boolean >(false);
  const [ isLoading , setIsLoading] = useState<boolean>(false);
  const [dateRange , setDateRange] = useState<{start_date?: string; end_date?: string}>({
  start_date : undefined,
  end_date : undefined
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

    const [confirmModal, setConfirmModal] = useState<{
    show: "open" | "close" | "confirm";
    id: string | null;
  }>({ show: "close", id: null });

  const [faceVerified, setFaceVerified] = useState<boolean>(false);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);


 useEffect(()=>{
  setIsCheckedIn(userTodayAttendance?.check_in !== null && userTodayAttendance?.check_out === null);
 },[userTodayAttendance])


  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleProcessAttendance = async () => {
   setIsLoading(true);
    if (!isCheckedIn) {
     await  dispatch(checkInAction({ org_uuid :orgUUID, user_uuid :userUUID}));
      setIsModalOpen(false);
      setAttendanceMode(null);
      
    } else {
     await dispatch(checkOutAction({ org_uuid :orgUUID, user_uuid :userUUID}));
      setCheckInTime(null);
      setIsModalOpen(false);
      setAttendanceMode(null);
    }
      setConfirmModal({ show: "close", id: null });
      dispatch(getUserAttendancesAction({ org_uuid :orgUUID, user_uuid :userUUID, page: 1, limit: itemsPerPage, ...(dateRange.end_date && { date_range: dateRange}) }));
      dispatch(getUserTodayAttendancesAction({ org_uuid :orgUUID, user_uuid :userUUID}));
      setIsLoading(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil((userAttendance?.total || 0) / itemsPerPage);

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


  useEffect(() => {
    if (userUUID) {
      dispatch(getUserAttendancesAction({ org_uuid :orgUUID, user_uuid :userUUID, page: currentPage, limit: itemsPerPage, ...(dateRange.end_date && { date_range: dateRange }) }));
    }
  }, [dateRange?.end_date, currentPage]);

    useEffect(() => {
    if (userUUID) {
      dispatch(getUserTodayAttendancesAction({ org_uuid :orgUUID, user_uuid :userUUID}));
    }
  }, [dateRange?.end_date]);


     function getPercentage(partialValue: number, totalValue: number) { 
    if (totalValue === 0) return 0;
    return (partialValue / totalValue) * 100;
     }

  return (
    <div className="flex h-[calc(100vh-45px)] max-h-[calc(100vh-45px)] overflow-hidden bg-[#FDFDFD] text-slate-900 font-sans selection:bg-orange-100">
      <main className="flex-1 flex flex-col min-w-0">
 

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* TOP CARDS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2 relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col md:flex-row items-center justify-between group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl group-hover:bg-orange-100 transition-colors duration-500"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-2 w-2 rounded-full bg-[#FF6B00] animate-pulse"></span>
                    <h2 className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">System Status: Live</h2>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-5xl font-black tracking-tighter text-slate-800 tabular-nums">
                      {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                    </span>
                    <span className="text-slate-500 font-medium mt-1 flex items-center gap-2">
                      <Calendar size={14} className="text-[#FF6B00]" />
                      {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                
                <div className="relative z-10 mt-6 md:mt-0 flex flex-col items-center">
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className={`relative group flex items-center gap-3 px-10 py-4 rounded-xl font-black tracking-tight transition-all transform hover:-translate-y-0.5 active:scale-95 shadow-xl ${
                      isCheckedIn
                      ? 'bg-white text-rose-500 border-2 border-rose-100 hover:border-rose-200 shadow-rose-100' 
                      : 'bg-[#FF6B00] text-white hover:bg-[#E66000] shadow-orange-200'
                    }`}
                  >
                    {isCheckedIn ? <LogOut size={20} /> : <ArrowRightLeft size={20} />}
                    {isCheckedIn ? 'CLOCK OUT' : 'MARK ATTENDANCE'}
                  </button>
                  {isCheckedIn && (
                    <p className="text-[10px] mt-3 font-bold text-emerald-500 uppercase tracking-widest">
                      Started at {checkInTime}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Efficiency</h3>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-4xl font-black tracking-tighter text-slate-800">{getPercentage(userAttendance.total_present_current_month, userAttendance.total_present_current_month + userAttendance.total_absent_current_month)}<span className="text-lg text-slate-400">%</span></span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#FF6B00] h-full rounded-full shadow-[0_0_8px_rgba(255,107,0,0.4)]" style={{ width: `${getPercentage(userAttendance.total_present_current_month, userAttendance.total_present_current_month + userAttendance.total_absent_current_month)}%` }}></div>
                  </div>
                </div>
                <div className="flex gap-4 mt-6 text-slate-800">
                  <div className="flex-1 bg-slate-50 rounded-lg p-3 border border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Present</p>
                    <p className="text-lg font-black">{userAttendance.total_present_current_month}</p>
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-lg p-3 border border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Absent</p>
                    <p className="text-lg font-black text-rose-500">{userAttendance.total_absent_current_month}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* TABLE SECTION */}
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
      </main>

      {/* Attendance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="relative p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  {isCheckedIn ? 'Confirm Clock Out' : 'Mark Your Attendance'}
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {currentTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <button onClick={() => { setIsModalOpen(false); setAttendanceMode(null); }} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              {!attendanceMode ? (
                <div className="flex gap-6  justify-center items-center">
                { organizationSettings?.attendance_method !==OrgAttendanceMethod.MANUAL    &&        <button 
                    onClick={() => {setConfirmModal({ show: "open", id: null }) ;setAttendanceMode(null) ;setIsModalOpen(false);}}
                    className="flex w-[100%] flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-slate-100 hover:border-[#FF6B00] hover:bg-orange-50/50 transition-all group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center group-hover:bg-[#FF6B00] transition-colors">
                      <Camera size={32} className="text-[#FF6B00] group-hover:text-white" />
                    </div>
                    <span className="font-black text-sm text-slate-800">Camera / AI</span>
                  </button>}
                 {   organizationSettings?.attendance_method !==OrgAttendanceMethod.FACE    &&  <button 
                    onClick={() => setAttendanceMode('manual')}
                    className="flex w-[100%] flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-slate-100 hover:border-[#FF6B00] hover:bg-orange-50/50 transition-all group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-[#FF6B00] transition-colors">
                      <Keyboard size={32} className="text-blue-600 group-hover:text-white" />
                    </div>
                    <span className="font-black text-sm text-slate-800">Manual Entry</span>
                  </button>}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                    <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 font-medium leading-relaxed">Manual marking is logged and may require approval from your manager if frequent.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Time Stamp</label>
                    <div className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-xl font-black tabular-nums text-slate-800">
                      {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                    </div>
                  </div>
                  <div className="flex gap-3 w-full">
                    <button onClick={() => setAttendanceMode(null)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Back</button>
                    <button onClick={() => handleProcessAttendance()} className="flex-[2] py-4 bg-slate-800 text-white font-black rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-900 transition-all">
                      CONFIRM MANUAL LOG
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
        @keyframes scan {
          0% { top: 10%; }
          100% { top: 90%; }
        }
        .animate-scan {
          animation: scan 2s linear infinite alternate;
          position: absolute;
          left: 1rem;
          right: 1rem;
        }
      `}} />
   
     <ConfirmationDialog
      title={!isCheckedIn ? "Check Out" : "Check In"}
      message={`Are you are sure you want to ${
        !isCheckedIn ? "Check-Out" : "Check-In"
      }`}
      confirmText="Confirm"
      disableConfirm={!faceVerified || isLoading} 
      handleConfirmAction={()=> handleProcessAttendance()}
      setConfirmModal={setConfirmModal}
      confirmModal={confirmModal}
    >
      <FaceDetection setVerified={(value) => setFaceVerified(value)} />
    </ConfirmationDialog>
    </div>
  );
};


export default App;