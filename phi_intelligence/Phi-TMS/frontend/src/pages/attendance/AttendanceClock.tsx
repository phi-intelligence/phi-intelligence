import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Attendance, ApiResponse } from '@/types';
import { Clock, Coffee, LogIn, LogOut } from 'lucide-react';
import { formatTime, formatHours } from '@/utils/formatters';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusBadge from '@/components/StatusBadge';
import CircularProgress from '@/components/dashboard/CircularProgress';
import toast from 'react-hot-toast';

const AttendanceClock = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchTodayStatus();

    // Update clock every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const response = await api.get<ApiResponse<Attendance | null>>('/attendance/daily-status');
      setTodayAttendance(response.data.data);
    } catch (error) {
      console.error('Failed to fetch attendance status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    setActionLoading(true);
    try {
      const response = await api.post<ApiResponse<Attendance>>('/attendance/clock-in');
      setTodayAttendance(response.data.data);
      toast.success('Clocked in successfully!');
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    try {
      const response = await api.post<ApiResponse<Attendance>>('/attendance/clock-out');
      setTodayAttendance(response.data.data);
      toast.success('Clocked out successfully!');
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartBreak = async () => {
    setActionLoading(true);
    try {
      const response = await api.post<ApiResponse<Attendance>>('/attendance/break-start');
      setTodayAttendance(response.data.data);
      toast.success('Break started');
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndBreak = async () => {
    setActionLoading(true);
    try {
      const response = await api.post<ApiResponse<Attendance>>('/attendance/break-end');
      setTodayAttendance(response.data.data);
      toast.success('Break ended');
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isClockedIn = todayAttendance && todayAttendance.clockIn && !todayAttendance.clockOut;
  const onBreak = isClockedIn && todayAttendance.breakStart && !todayAttendance.breakEnd;

  const currentHours = todayAttendance?.totalHours || 0;
  const workProgress = (currentHours / 8) * 100;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Attendance</h1>
        <p className="text-text-secondary mt-1">Clock in and out to track your working hours</p>
      </div>

      {/* Current Time Display with Circular Progress */}
      <div className="card text-center">
        <CircularProgress percentage={workProgress} size={160}>
          <div>
            <div className="text-3xl font-bold text-text-primary mb-1">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-text-muted">
              {formatHours(currentHours)} / 8h
            </div>
          </div>
        </CircularProgress>
        <div className="text-lg text-text-secondary mt-4">
          {currentTime.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Today's Status */}
      {todayAttendance && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">Today's Record</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-text-secondary mb-1">Clock In</div>
              <div className="text-lg font-semibold text-text-primary">
                {todayAttendance.clockIn ? formatTime(todayAttendance.clockIn) : '-'}
              </div>
            </div>
            <div>
              <div className="text-sm text-text-secondary mb-1">Clock Out</div>
              <div className="text-lg font-semibold text-text-primary">
                {todayAttendance.clockOut ? formatTime(todayAttendance.clockOut) : '-'}
              </div>
            </div>
            <div>
              <div className="text-sm text-text-secondary mb-1">Hours Worked</div>
              <div className="text-lg font-semibold text-text-primary">
                {todayAttendance.totalHours ? formatHours(todayAttendance.totalHours) : '-'}
              </div>
            </div>
            <div>
              <div className="text-sm text-text-secondary mb-1">Status</div>
              <StatusBadge status={todayAttendance.status} />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-text-primary">Actions</h2>
        
        {/* Status Indicator */}
        <div className="mb-6 p-4 rounded-card bg-gray-50">
          <div className="flex items-center justify-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isClockedIn ? (onBreak ? 'bg-yellow-500' : 'bg-accent') : 'bg-gray-400'}`}></div>
            <span className="font-medium text-text-primary">
              {!isClockedIn ? 'Not Clocked In' : onBreak ? 'On Break' : 'Clocked In'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Clock In/Out */}
          {!isClockedIn ? (
            <button
              onClick={handleClockIn}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-3 p-6 rounded-card bg-accent text-text-primary hover:bg-accent-dark transition-colors disabled:opacity-50 shadow-soft"
            >
              <LogIn className="w-8 h-8" />
              <div className="text-left">
                <div className="font-semibold text-lg">Clock In</div>
                <div className="text-sm">Start your work day</div>
              </div>
            </button>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleClockOut}
                disabled={actionLoading || onBreak}
                className={`flex items-center justify-center gap-3 p-6 rounded-card transition-colors disabled:opacity-50 shadow-soft ${
                  onBreak 
                    ? 'bg-gray-50 text-text-muted cursor-not-allowed' 
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                <LogOut className="w-8 h-8" />
                <div className="text-left">
                  <div className="font-semibold text-lg">Clock Out</div>
                  <div className="text-sm">
                    {onBreak ? 'End break first' : 'End your work day'}
                  </div>
                </div>
              </button>

              {/* Break Button */}
              {!onBreak ? (
                <button
                  onClick={handleStartBreak}
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-3 p-6 rounded-card bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors disabled:opacity-50 shadow-soft"
                >
                  <Coffee className="w-8 h-8" />
                  <div className="text-left">
                    <div className="font-semibold text-lg">Start Break</div>
                    <div className="text-sm">Take a break</div>
                  </div>
                </button>
              ) : (
                <button
                  onClick={handleEndBreak}
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-3 p-6 rounded-card bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50 shadow-soft"
                >
                  <Coffee className="w-8 h-8" />
                  <div className="text-left">
                    <div className="font-semibold text-lg">End Break</div>
                    <div className="text-sm">Resume work</div>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Status Messages */}
        {onBreak && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-card">
            <p className="text-yellow-800 text-center font-medium">
              ⚠️ You are currently on break. End your break before clocking out.
            </p>
          </div>
        )}

        {isClockedIn && !onBreak && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-card">
            <p className="text-green-800 text-center font-medium">
              ✅ You are clocked in and working. You can take a break or clock out.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceClock;

