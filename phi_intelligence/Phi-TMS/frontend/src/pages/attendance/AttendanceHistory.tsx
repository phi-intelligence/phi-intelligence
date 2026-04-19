import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Attendance } from '@/types';
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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Download } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusBadge from '@/components/StatusBadge';
import toast from 'react-hot-toast';

type ViewMode = 'calendar' | 'list';

const AttendanceHistory = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendance, setAttendance] = useState<Attendance[]>([]);
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
      
      const response = await api.get(
        `/attendance/my-attendance?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      );
      
      setAttendance(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load attendance data');
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
      toast.error('No data to export');
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
    
    toast.success('Attendance exported successfully');
  };

  // Calculate summary statistics
  const summary = {
    daysWorked: attendance.filter((a) => a.clockIn).length,
    totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
    avgHours: 0,
    overtime: attendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0),
  };
  summary.avgHours = summary.daysWorked > 0 ? summary.totalHours / summary.daysWorked : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">My Attendance</h1>
        <p className="text-text-secondary mt-1">View your attendance history and records</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-card shadow-soft border-0 p-6">
          <div className="text-sm text-text-secondary mb-1">Days Worked</div>
          <div className="text-3xl font-bold text-text-primary">{summary.daysWorked}</div>
        </div>
        <div className="bg-white rounded-card shadow-soft border-0 p-6">
          <div className="text-sm text-text-secondary mb-1">Total Hours</div>
          <div className="text-3xl font-bold text-text-primary">{summary.totalHours.toFixed(1)}h</div>
        </div>
        <div className="bg-white rounded-card shadow-soft border-0 p-6">
          <div className="text-sm text-text-secondary mb-1">Average Hours/Day</div>
          <div className="text-3xl font-bold text-green-600">{summary.avgHours.toFixed(1)}h</div>
        </div>
        <div className="bg-white rounded-card shadow-soft border-0 p-6">
          <div className="text-sm text-text-secondary mb-1">Overtime</div>
          <div className="text-3xl font-bold text-orange-600">{summary.overtime.toFixed(1)}h</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-card shadow-soft border-0 p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Month Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-card transition"
            >
              <ChevronLeft className="w-5 h-5 text-text-secondary" />
            </button>
            <div className="text-lg font-semibold text-text-primary min-w-[180px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-card transition"
            >
              <ChevronRight className="w-5 h-5 text-text-secondary" />
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-2 text-sm text-text-primary hover:bg-blue-50 rounded-card transition"
            >
              Today
            </button>
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-card transition flex items-center gap-2 ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-card transition flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-gray-100 text-text-secondary hover:bg-gray-200 rounded-card transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : viewMode === 'calendar' ? (
        <CalendarView attendance={attendance} currentDate={currentDate} />
      ) : (
        <ListView attendance={attendance} />
      )}
    </div>
  );
};

// Calendar View Component
const CalendarView = ({ attendance, currentDate }: { attendance: Attendance[]; currentDate: Date }) => {
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

  const getStatusColor = (att?: Attendance) => {
    if (!att) return 'bg-gray-50';
    if (att.status === 'PRESENT') return 'bg-green-50 border-green-200';
    if (att.status === 'LEAVE') return 'bg-blue-50 border-blue-200';
    if (att.status === 'LATE' || att.status === 'HALF_DAY') return 'bg-yellow-50 border-yellow-200';
    if (att.status === 'ABSENT') return 'bg-red-50 border-red-200';
    return 'bg-gray-50';
  };

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="bg-white rounded-card shadow-soft border-0 overflow-hidden">
      {/* Calendar Header */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="p-4 text-center text-sm font-medium text-text-secondary">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {weeks.map((week, weekIdx) =>
          week.map((day, dayIdx) => {
            const att = getAttendanceForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={`${weekIdx}-${dayIdx}`}
                className={`min-h-[100px] p-2 border-b border-r border-gray-200 ${getStatusColor(att)} ${
                  !isCurrentMonth ? 'opacity-40' : ''
                } ${isCurrentDay ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`text-sm font-medium ${
                      isCurrentMonth ? 'text-text-primary' : 'text-text-muted'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {att && att.status && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-white border border-gray-300">
                      {att.status}
                    </span>
                  )}
                </div>
                {att && att.clockIn && (
                  <div className="text-xs text-text-secondary">
                    <div>{format(new Date(att.clockIn), 'HH:mm')}</div>
                    {att.clockOut && <div>{format(new Date(att.clockOut), 'HH:mm')}</div>}
                    {att.totalHours && (
                      <div className="font-semibold mt-1 text-text-primary">
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
};

// List View Component
const ListView = ({ attendance }: { attendance: Attendance[] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const sortedAttendance = [...attendance].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const totalPages = Math.ceil(sortedAttendance.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedAttendance.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white rounded-card shadow-soft border-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Clock In</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Clock Out</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Break</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Hours</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.map((att) => (
              <tr key={att.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {format(new Date(att.date), 'EEE, MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {att.clockIn ? format(new Date(att.clockIn), 'HH:mm') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {att.clockOut ? format(new Date(att.clockOut), 'HH:mm') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {att.breakStart && att.breakEnd
                    ? `${format(new Date(att.breakStart), 'HH:mm')} - ${format(new Date(att.breakEnd), 'HH:mm')}`
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-text-primary">
                  {att.totalHours?.toFixed(2) || '0'}h
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={att.status} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-text-secondary">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedAttendance.length)} of{' '}
            {sortedAttendance.length} records
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-text-secondary">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;
