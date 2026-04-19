import { useState, useEffect } from 'react';
import { tmsApi } from '@/services/tmsApi';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'calendar' | 'list';

export default function AttendanceHistory() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('attendanceViewMode') as ViewMode) || 'calendar';
  });

  useEffect(() => {
    fetchAttendance();
  }, [currentDate]);

  useEffect(() => {
    localStorage.setItem('attendanceViewMode', viewMode);
  }, [viewMode]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      
      const response = await tmsApi.get<{ data: any[] }>(
        `/attendance/my-attendance?start_date=${encodeURIComponent(start.toISOString())}&end_date=${encodeURIComponent(end.toISOString())}`
      );
      
      setAttendance(response.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load attendance data",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleExportCSV = () => {
    if (attendance.length === 0) {
      toast({ title: "No data to export" });
      return;
    }

    const headers = ['Date', 'Clock In', 'Clock Out', 'Break Start', 'Break End', 'Total Hours', 'Status'];
    const rows = attendance.map((a) => [
      format(new Date(a.date), 'yyyy-MM-dd'),
      a.clockIn ? format(new Date(a.clockIn), 'HH:mm') : '-',
      a.clockOut ? format(new Date(a.clockOut), 'HH:mm') : '-',
      a.breakStart ? format(new Date(a.breakStart), 'HH:mm') : '-',
      a.breakEnd ? format(new Date(a.breakEnd), 'HH:mm') : '-',
      a.totalHours?.toFixed(2) || '0',
      a.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${format(currentDate, 'yyyy-MM')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Attendance exported successfully" });
  };

  const summary = {
    daysWorked: attendance.filter((a) => a.clockIn).length,
    totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
    avgHours: 0,
    overtime: attendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0),
  };
  summary.avgHours = summary.daysWorked > 0 ? summary.totalHours / summary.daysWorked : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-rajdhani tracking-wider text-stone-900 uppercase">History</h1>
        <p className="text-stone-500 mt-1 text-sm">View your attendance history and records</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-5">
          <div className="text-xs font-semibold tracking-widest text-stone-400 uppercase mb-2">Days Worked</div>
          <div className="text-3xl font-bold text-stone-900 font-rajdhani">{summary.daysWorked}</div>
        </div>
        <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-5">
          <div className="text-xs font-semibold tracking-widest text-stone-400 uppercase mb-2">Total Hours</div>
          <div className="text-3xl font-bold text-stone-900 font-rajdhani">{summary.totalHours.toFixed(1)}<span className="text-sm text-stone-400 ml-1">h</span></div>
        </div>
        <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-5">
          <div className="text-xs font-semibold tracking-widest text-stone-400 uppercase mb-2">Average / Day</div>
          <div className="text-3xl font-bold text-[#00A3FF] font-rajdhani">{summary.avgHours.toFixed(1)}<span className="text-sm text-stone-400 ml-1">h</span></div>
        </div>
        <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-5">
          <div className="text-xs font-semibold tracking-widest text-stone-400 uppercase mb-2">Overtime</div>
          <div className="text-3xl font-bold text-amber-600 font-rajdhani">{summary.overtime.toFixed(1)}<span className="text-sm text-stone-400 ml-1">h</span></div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-stone-50 rounded-lg transition text-stone-500 hover:text-stone-900">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-sm font-bold font-rajdhani tracking-wider text-stone-900 min-w-[130px] text-center uppercase">
            {format(currentDate, 'MMMM yyyy')}
          </div>
          <button onClick={handleNextMonth} className="p-2 hover:bg-stone-50 rounded-lg transition text-stone-500 hover:text-stone-900">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={handleToday} className="px-3 py-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition uppercase tracking-wider">
            Today
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${
              viewMode === 'calendar' ? 'bg-[#EBF5FF] text-[#00A3FF] border border-[#00A3FF]/20' : 'bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Calendar
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${
              viewMode === 'list' ? 'bg-[#EBF5FF] text-[#00A3FF] border border-[#00A3FF]/20' : 'bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            List
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-stone-900 rounded-lg transition flex items-center gap-2 text-xs font-semibold uppercase tracking-wider border border-stone-200 ml-1"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-7 h-7 animate-spin text-[#00A3FF]" />
        </div>
      ) : viewMode === 'calendar' ? (
        <CalendarView attendance={attendance} currentDate={currentDate} />
      ) : (
        <ListView attendance={attendance} />
      )}
    </div>
  );
}

function CalendarView({ attendance, currentDate }: { attendance: any[]; currentDate: Date }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getAttendanceForDay = (day: Date) => {
    return attendance.find(
      (a) => format(new Date(a.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );
  };

  const getStatusColor = (att?: any) => {
    if (!att) return 'bg-transparent border-stone-100';
    if (att.status === 'PRESENT') return 'bg-emerald-50 border-emerald-200';
    if (att.status === 'LEAVE') return 'bg-blue-50 border-blue-200';
    if (att.status === 'LATE' || att.status === 'HALF_DAY') return 'bg-amber-50 border-amber-200';
    if (att.status === 'ABSENT') return 'bg-red-50 border-red-200';
    return 'bg-transparent border-stone-100';
  };

  const getStatusTextColor = (att?: any) => {
    if (!att) return 'text-stone-400';
    if (att.status === 'PRESENT') return 'text-emerald-600';
    if (att.status === 'LEAVE') return 'text-[#00A3FF]';
    if (att.status === 'LATE' || att.status === 'HALF_DAY') return 'text-amber-600';
    if (att.status === 'ABSENT') return 'text-red-600';
    return 'text-stone-400';
  };

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="bg-white border border-stone-200 shadow-sm rounded-2xl overflow-hidden">
      <div className="grid grid-cols-7 bg-stone-50 border-b border-stone-200">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="p-3 text-center text-xs font-semibold tracking-widest text-stone-400 uppercase">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {weeks.map((week, weekIdx) =>
          week.map((day, dayIdx) => {
            const att = getAttendanceForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={`${weekIdx}-${dayIdx}`}
                className={`min-h-[110px] p-2.5 border-b border-r border-stone-100 transition-all ${getStatusColor(att)} ${
                  !isCurrentMonth ? 'opacity-30' : ''
                } ${isCurrentDay ? 'ring-2 ring-inset ring-[#00A3FF]' : ''}`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className={`text-sm font-bold font-rajdhani ${isCurrentMonth ? 'text-stone-900' : 'text-stone-300'} ${isCurrentDay ? 'text-[#00A3FF]' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {att?.status && (
                    <span className={`text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded ${getStatusTextColor(att)} bg-white/80`}>
                      {att.status}
                    </span>
                  )}
                </div>
                {att?.clockIn && (
                  <div className="text-[10px] text-stone-500 space-y-0.5 mt-2">
                    <div className="flex justify-between"><span>In:</span> <span className="text-stone-900 font-medium">{format(new Date(att.clockIn), 'HH:mm')}</span></div>
                    {att.clockOut && <div className="flex justify-between"><span>Out:</span> <span className="text-stone-900 font-medium">{format(new Date(att.clockOut), 'HH:mm')}</span></div>}
                    {att.totalHours && (
                      <div className="pt-1.5 mt-1.5 border-t border-stone-200 font-bold text-[#00A3FF] text-right">
                        {att.totalHours.toFixed(1)}h
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ListView({ attendance }: { attendance: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  const sortedAttendance = [...attendance].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const totalPages = Math.ceil(sortedAttendance.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedAttendance.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    if (status === 'PRESENT') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'LEAVE') return 'bg-blue-50 text-[#00A3FF] border-blue-200';
    if (status === 'LATE' || status === 'HALF_DAY') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (status === 'ABSENT') return 'bg-red-50 text-red-600 border-red-200';
    return 'bg-stone-50 text-stone-600 border-stone-200';
  };

  return (
    <div className="bg-white border border-stone-200 shadow-sm rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              <th className="px-6 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase">Date</th>
              <th className="px-6 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase">Clock In</th>
              <th className="px-6 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase">Clock Out</th>
              <th className="px-6 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase">Break</th>
              <th className="px-6 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase text-right">Hours</th>
              <th className="px-6 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {paginatedData.map((att) => (
              <tr key={att.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-3.5 whitespace-nowrap text-sm font-medium text-stone-900">
                  {format(new Date(att.date), 'EEE, MMM d, yyyy')}
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap text-sm text-stone-600">
                  {att.clockIn ? format(new Date(att.clockIn), 'HH:mm') : '—'}
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap text-sm text-stone-600">
                  {att.clockOut ? format(new Date(att.clockOut), 'HH:mm') : '—'}
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap text-sm text-stone-600">
                  {att.breakStart && att.breakEnd
                    ? `${format(new Date(att.breakStart), 'HH:mm')} – ${format(new Date(att.breakEnd), 'HH:mm')}`
                    : '—'}
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap text-sm font-bold text-[#00A3FF] text-right">
                  {att.totalHours?.toFixed(2) || '0'}h
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase border ${getStatusColor(att.status)}`}>
                    {att.status}
                  </span>
                </td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-stone-400 text-sm">
                  No attendance records found for this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-stone-100 flex justify-between items-center bg-stone-50">
          <div className="text-xs text-stone-400 uppercase tracking-widest font-semibold">
            Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, sortedAttendance.length)} of {sortedAttendance.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-semibold tracking-wider uppercase bg-white border border-stone-200 hover:bg-stone-50 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed text-stone-600"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-semibold tracking-wider uppercase bg-white border border-stone-200 hover:bg-stone-50 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed text-stone-600"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
