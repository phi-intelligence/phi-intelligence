import { useEffect, useState } from 'react';
import { tmsApi } from '@/services/tmsApi';
import { Clock, Coffee, LogIn, LogOut, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function AttendanceClock() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchTodayStatus();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const response = await tmsApi.get<{data: any}>('/attendance/daily-status');
      setTodayAttendance(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'clock-in' | 'clock-out' | 'break-start' | 'break-end') => {
    setActionLoading(true);
    try {
      const response = await tmsApi.post<{data: any}>(`/attendance/${action}`);
      setTodayAttendance(response.data);
      const actionNames = {
        'clock-in': 'Clocked in',
        'clock-out': 'Clocked out',
        'break-start': 'Break started',
        'break-end': 'Break ended'
      };
      toast({ title: `${actionNames[action]} successfully!` });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${action.replace('-', ' ')}`,
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 animate-spin text-[#00A3FF]" />
      </div>
    );
  }

  const isClockedIn = todayAttendance && todayAttendance.clockIn && !todayAttendance.clockOut;
  const onBreak = isClockedIn && todayAttendance.breakStart && !todayAttendance.breakEnd;
  const isClockedOut = todayAttendance && todayAttendance.clockOut;

  const currentHours = todayAttendance?.totalHours || 0;
  const workProgress = (currentHours / 8) * 100;

  const formatTimeStr = (isoString: string) => format(new Date(isoString), 'HH:mm');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-rajdhani tracking-wider text-stone-900 uppercase">Attendance</h1>
        <p className="text-stone-500 mt-1 text-sm">Clock in and out to track your working hours</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Clock Card */}
        <div className="bg-white border border-stone-200 shadow-sm p-8 rounded-2xl flex flex-col items-center justify-center text-center">
          <div className="relative w-44 h-44 mb-5">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#F0EDE8" strokeWidth="6" />
              <circle
                cx="50" cy="50" r="45" fill="none" stroke="#00A3FF"
                className="transition-all duration-1000 ease-in-out"
                strokeWidth="6"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * Math.min(workProgress / 100, 1))}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-stone-900 font-rajdhani tracking-wider">
                {format(currentTime, 'HH:mm')}
              </span>
              <span className="text-sm text-stone-400 mt-1">
                {currentHours.toFixed(2)} / 8h
              </span>
            </div>
          </div>
          <div className="text-sm text-stone-500">
            {format(currentTime, 'EEEE, MMMM d, yyyy')}
          </div>
        </div>

        {/* Actions Card */}
        <div className="bg-white border border-stone-200 shadow-sm p-8 rounded-2xl flex flex-col justify-center space-y-3">
          <h3 className="text-xs font-semibold tracking-widest text-stone-400 uppercase mb-2">Actions</h3>

          <button
            onClick={() => handleAction('clock-in')}
            disabled={isClockedIn || isClockedOut || actionLoading}
            className={`flex items-center justify-center gap-3 w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
              !isClockedIn && !isClockedOut
                ? 'bg-[#00A3FF] text-white hover:bg-[#0090e0] shadow-sm'
                : 'bg-stone-50 text-stone-300 cursor-not-allowed border border-stone-100'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Clock In
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAction('break-start')}
              disabled={!isClockedIn || onBreak || isClockedOut || actionLoading}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                isClockedIn && !onBreak && !isClockedOut
                  ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200'
                  : 'bg-stone-50 text-stone-300 cursor-not-allowed border border-stone-100'
              }`}
            >
              <Coffee className="w-4 h-4" />
              Break
            </button>

            <button
              onClick={() => handleAction('break-end')}
              disabled={!onBreak || isClockedOut || actionLoading}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                onBreak && !isClockedOut
                  ? 'bg-[#EBF5FF] text-[#00A3FF] hover:bg-blue-100 border border-[#00A3FF]/20'
                  : 'bg-stone-50 text-stone-300 cursor-not-allowed border border-stone-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              Resume
            </button>
          </div>

          <button
            onClick={() => handleAction('clock-out')}
            disabled={!isClockedIn || isClockedOut || actionLoading}
            className={`flex items-center justify-center gap-3 w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
              isClockedIn && !isClockedOut
                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                : 'bg-stone-50 text-stone-300 cursor-not-allowed border border-stone-100'
            }`}
          >
            <LogOut className="w-4 h-4" />
            Clock Out
          </button>
        </div>
      </div>

      {/* Today's Record */}
      <div className="bg-white border border-stone-200 shadow-sm p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs font-semibold tracking-widest text-stone-400 uppercase">Today's Record</h3>
          {todayAttendance?.status && (
            <span className="px-3 py-1 bg-stone-100 rounded-full text-xs font-semibold tracking-wider uppercase text-stone-500">
              {todayAttendance.status}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
            <div className="text-xs text-stone-400 uppercase tracking-wider mb-2">Clock In</div>
            <div className="text-xl font-bold text-stone-900">
              {todayAttendance?.clockIn ? formatTimeStr(todayAttendance.clockIn) : '—'}
            </div>
          </div>
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
            <div className="text-xs text-stone-400 uppercase tracking-wider mb-2">Clock Out</div>
            <div className="text-xl font-bold text-stone-900">
              {todayAttendance?.clockOut ? formatTimeStr(todayAttendance.clockOut) : '—'}
            </div>
          </div>
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
            <div className="text-xs text-stone-400 uppercase tracking-wider mb-2">Total Hours</div>
            <div className="text-xl font-bold text-stone-900">
              {todayAttendance?.totalHours ? `${todayAttendance.totalHours.toFixed(2)}h` : '—'}
            </div>
          </div>
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
            <div className="text-xs text-stone-400 uppercase tracking-wider mb-2">Break Time</div>
            <div className="text-xl font-bold text-stone-900">
              {todayAttendance?.breakStart ? (
                todayAttendance.breakEnd ? 'Completed' : 'On Break'
              ) : '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
