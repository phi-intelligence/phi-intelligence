import { useState, useEffect } from 'react';
import { timelogApi } from '../../services/timelogApi';
import { useAuth } from '../../contexts/AuthContext';
import type { TimeLog } from '../../types/timelog';
import LoadingSpinner from '../../components/LoadingSpinner';
import TimeLogModal from '../../components/time/TimeLogModal';
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2 } from 'lucide-react';
import { startOfWeek, endOfWeek, format, addWeeks, subWeeks, eachDayOfInterval } from 'date-fns';
import toast from 'react-hot-toast';

const Timesheet = () => {
  const { user } = useAuth();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTimeLogModal, setShowTimeLogModal] = useState(false);

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });

  useEffect(() => {
    if (user) {
      fetchTimeLogs();
    }
  }, [currentWeekStart, user]);

  const fetchTimeLogs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await timelogApi.getUserTimesheet(
        user.id,
        currentWeekStart,
        weekEnd
      );
      setTimeLogs(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load timesheet');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const handleThisWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const handleDeleteTimeLog = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this time log?')) return;

    try {
      await timelogApi.deleteTimeLog(id);
      toast.success('Time log deleted');
      fetchTimeLogs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete time log');
    }
  };

  const getTotalHours = () => {
    return timeLogs.reduce((sum, log) => sum + log.hours, 0);
  };

  const getHoursForDay = (date: Date): number => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return timeLogs
      .filter((log) => format(new Date(log.date), 'yyyy-MM-dd') === dateStr)
      .reduce((sum, log) => sum + log.hours, 0);
  };

  const getLogsForDay = (date: Date): TimeLog[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return timeLogs.filter((log) => format(new Date(log.date), 'yyyy-MM-dd') === dateStr);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Timesheet</h1>
        <p className="text-text-secondary mt-1">Track your weekly time logs</p>
      </div>

      {/* Week Navigation */}
      <div className="bg-white rounded-card shadow-soft border-0 p-6 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousWeek}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-lg font-semibold text-text-primary">
              Week of {format(currentWeekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </h2>
            <button
              onClick={handleThisWeek}
              className="text-sm text-text-primary hover:text-blue-700 mt-1"
            >
              Go to This Week
            </button>
          </div>

          <button
            onClick={handleNextWeek}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Total Hours */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <div className="text-sm text-text-secondary">Total Hours This Week</div>
          <div className="text-3xl font-bold text-text-primary mt-1">{getTotalHours().toFixed(1)}h</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowTimeLogModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-card hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Log Time
        </button>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayLogs = getLogsForDay(day);
          const dayHours = getHoursForDay(day);
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

          return (
            <div
              key={day.toISOString()}
              className={`bg-white rounded-card shadow-soft border p-4 ${
                isToday ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
              }`}
            >
              {/* Day Header */}
              <div className="mb-3 pb-3 border-b border-gray-200">
                <div className="text-sm text-text-secondary">{format(day, 'EEE')}</div>
                <div className="text-lg font-semibold text-text-primary">{format(day, 'd')}</div>
                <div className="text-xs font-medium text-text-primary mt-1">{dayHours.toFixed(1)}h</div>
              </div>

              {/* Day Logs */}
              <div className="space-y-2">
                {dayLogs.length === 0 ? (
                  <div className="text-xs text-text-muted italic">No entries</div>
                ) : (
                  dayLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2 bg-gray-50 rounded border-0 hover:border-gray-300 transition"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-xs font-medium text-text-primary truncate flex-1">
                          {log.project?.name || 'Unknown'}
                        </div>
                        {!log.isApproved && (
                          <button
                            onClick={() => handleDeleteTimeLog(log.id)}
                            className="text-red-500 hover:text-red-700 ml-1"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {log.task && (
                        <div className="text-xs text-text-secondary truncate mb-1">{log.task.title}</div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-text-primary">{log.hours}h</span>
                        {log.isApproved ? (
                          <span className="text-xs text-green-600">✓ Approved</span>
                        ) : (
                          <span className="text-xs text-yellow-600">Pending</span>
                        )}
                      </div>
                      {log.description && (
                        <div className="text-xs text-text-muted mt-1 truncate" title={log.description}>
                          {log.description}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {timeLogs.length === 0 && (
        <div className="mt-6 bg-white rounded-card shadow-soft border-0 p-12 text-center">
          <div className="text-text-muted text-5xl mb-4">⏱️</div>
          <h3 className="text-lg font-medium text-text-primary mb-2">No time logged this week</h3>
          <p className="text-text-secondary mb-4">Start tracking your time by logging your work hours</p>
          <button
            onClick={() => setShowTimeLogModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-card hover:bg-blue-700 transition"
          >
            Log Your First Entry
          </button>
        </div>
      )}

      {/* Time Log Modal */}
      {showTimeLogModal && (
        <TimeLogModal
          onClose={() => setShowTimeLogModal(false)}
          onSuccess={fetchTimeLogs}
        />
      )}
    </div>
  );
};

export default Timesheet;





