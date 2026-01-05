import { Attendance } from '@/features/attendances/attendances.type';
import { DateRangePicker } from '@/shared/date-range-picker';
import { AlertCircle, Calendar, ChevronDown, ChevronUp, Download, Loader2 } from 'lucide-react';
import React, { JSX, useMemo } from 'react'




export default function AttendanceTable({
    setDateRange,
    userAttendance,
    userAttendanceLoading,
    currentPage,
    itemsPerPage,
    totalPages,
    handlePageChange,
    changeUTCtoLocalTime,
    getStatusBadge,
    expandedRowId,
    setExpandedRowId,
} : {  setDateRange :  React.Dispatch<React.SetStateAction<{
    start_date?: string;
    end_date?: string;
}>>,
    userAttendance: {
       rows :Attendance[]
    current_page ?: number
    total ?: number
    per_page ? :  number
    }
    userAttendanceLoading: boolean,
    currentPage: number,
    itemsPerPage: number,
    totalPages: number,
    handlePageChange: (page: number) => void,
    changeUTCtoLocalTime: (utcTime: string ) => string,
    getStatusBadge: (status: string) => JSX.Element,
    expandedRowId: number | null,
    setExpandedRowId: (id: number | null) => void,
}) {
  return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white shrink-0">
                <div className="flex items-center gap-4">
                  <h3 className="font-black text-xl tracking-tight text-slate-800">Attendance History</h3>
                  <span className="bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full text-[11px] font-bold min-w-fit whitespace-nowrap">{userAttendance?.total || 0} Total</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {useMemo(() => <DateRangePicker setDateRange={setDateRange} isFromYear={2} />, [setDateRange])}
            
                </div>
              </div>
              
              <div className="overflow-x-auto px-4 pb-4">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-slate-400">
                      <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest">Clock In</th>
                      <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest">Clock Out</th>
                      <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest">Duration</th>
                      <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {userAttendance.rows && userAttendance.rows.length > 0 ? (
                      userAttendance.rows.map((log , i) => (
                        <React.Fragment key={i}>
                        <tr className="group hover:scale-[1.002] transition-all duration-200">
                          <td className="px-6 py-5 bg-white border-y border-l border-slate-100 rounded-l-xl group-hover:border-[#FF6B00]/20 transition-colors">
                            <div className="flex items-center gap-3 text-slate-800">
                              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors">
                                <Calendar size={14} className="text-slate-400 group-hover:text-[#FF6B00]" />
                              </div>
                              <span className="font-bold text-sm">{log.date}</span>
                            </div>
                          </td>
                        <td className="px-6 py-5 bg-white border-y border-slate-100 group-hover:border-[#FF6B00]/20 transition-colors">
                          <span className={`text-sm font-bold ${log.check_in === null ? 'text-slate-300' : 'text-slate-700'}`}>{changeUTCtoLocalTime(log.check_in)}</span>
                        </td>
                        <td className="px-6 py-5 bg-white border-y border-slate-100 group-hover:border-[#FF6B00]/20 transition-colors">
                          <span className="text-sm font-bold text-slate-700">{changeUTCtoLocalTime(log.check_out)}</span>
                        </td>
                        <td className="px-6 py-5 bg-white border-y border-slate-100 group-hover:border-[#FF6B00]/20 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-12 bg-slate-100 h-1.5 rounded-full hidden sm:block">
                              <div className="bg-slate-300 h-full rounded-full" style={{ width: log.affected_hours === '0h' ? '0%' : '75%' }}></div>
                            </div>
                            <span className="text-sm font-bold text-slate-500 tabular-nums">{log.affected_hours}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 bg-white border-y border-slate-100 group-hover:border-[#FF6B00]/20 transition-colors">
                          {getStatusBadge(log.status)}
                        </td>
                        <td className="px-6 py-5 bg-white border-y border-r border-slate-100 rounded-r-xl group-hover:border-[#FF6B00]/20 text-right transition-colors">
                          <button 
                            onClick={() => {expandedRowId=== i ? setExpandedRowId(null) : setExpandedRowId(i)}}
                            className={`p-2 transition-all ${expandedRowId === i ? 'text-[#FF6B00] bg-orange-50' : 'text-slate-300 hover:text-slate-600'}`}
                          >
                        { expandedRowId === i ?  <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                          </button>
                        </td>
                      </tr>
                      
                    
                      {expandedRowId === i && (
                        <tr className="bg-slate-50">
                          <td colSpan={6} className="px-6 py-6">
                            <div className="bg-white rounded-xl border border-slate-200 p-6">
                              <div className="flex items-center gap-2 mb-4">
                                <AlertCircle size={16} className="text-[#FF6B00]" />
                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Attendance Logs</h4>
                                <span className="text-xs font-bold text-slate-400">({log.attendance_log?.length || 0} entries)</span>
                              </div>
                              
                              {log.attendance_log && log.attendance_log.length > 0 ? (
                                <div className="space-y-3">
                                  {log.attendance_log.map((attendanceLog: any, idx: number) => (
                                    <div key={idx} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-200">
                                        <span className="text-xs font-black text-slate-600">{idx + 1}</span>
                                      </div>
                                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</p>
                                          <p className="text-sm font-bold text-slate-800">{changeUTCtoLocalTime(attendanceLog.time)}</p>
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Type</p>
                                          <p className="text-sm font-bold text-slate-800">
                                            {attendanceLog.type ? (
                                              <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                                                attendanceLog.type.toLowerCase() === 'check_in' 
                                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                                              }`}>
                                                {attendanceLog.type.replace(/_/g, ' ')}
                                              </span>
                                            ) : (
                                              <span className="text-slate-400">---</span>
                                            )}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                                          <p className="text-sm font-bold text-slate-600 truncate" title={attendanceLog.location || 'Not recorded'}>
                                            {attendanceLog.location || <span className="text-slate-400">---</span>}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                    <AlertCircle size={24} className="text-slate-300" />
                                  </div>
                                  <p className="text-sm font-bold text-slate-600">No logs available</p>
                                  <p className="text-xs text-slate-400 mt-1">No detailed attendance logs found for this entry</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    ))
                    ) : !userAttendanceLoading ?(
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                              <Calendar size={32} className="text-slate-300" />
                            </div>
                            <div>
                              <p className="text-lg font-black text-slate-800 mb-1">No Attendance Records Found</p>
                              <p className="text-sm text-slate-500">There are no attendance records for the selected period.</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center">
                          <div className="flex justify-center items-center w-full">
                            <Loader2 className="animate-spin text-slate-400" size={24} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
          
              {totalPages >= 1 ? (
                <div className="flex items-center justify-between px-8 py-4 border-t border-slate-100">
                  <div className="text-sm text-slate-500">
                    Showing <span className="font-bold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-bold text-slate-700">{Math.min(currentPage * itemsPerPage, userAttendance?.total || 0)}</span> of{' '}
                    <span className="font-bold text-slate-700">{userAttendance?.total || 0}</span> entries
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1.5 text-sm font-bold rounded-lg transition-all ${
                            currentPage === pageNum
                              ? 'bg-[#FF6B00] text-white shadow-lg shadow-orange-200'
                              : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) :<>
              
              
              
              
              </>}
            </div> 
  )
}
