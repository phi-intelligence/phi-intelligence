import { useEffect, useState, useCallback } from 'react';
import { Link } from 'wouter';
import { useEmployee } from '@/contexts/EmployeeContext';
import { tmsApi, unwrapTmsPaginatedList } from '@/services/tmsApi';
import { Clock, Briefcase, CheckSquare, Loader2, Coffee } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function EmployeeDashboard() {
  const { user } = useEmployee();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [breakLoading, setBreakLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [taskCountByStatus, setTaskCountByStatus] = useState<Record<string, number>>({
    TODO: 0,
    IN_PROGRESS: 0,
    IN_REVIEW: 0,
    DONE: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch Attendance
      const attendanceRes = await tmsApi.get<{data: any}>('/attendance/daily-status');
      setTodayAttendance(attendanceRes.data);

      // Fetch Projects & Tasks
      const [projectsRes, tasksRes] = await Promise.all([
        tmsApi.get<{ data?: unknown }>('/projects?status=ACTIVE&page=1&limit=5'),
        tmsApi.get<{ data: any[] }>('/tasks/my-tasks')
      ]);

      setActiveProjects(unwrapTmsPaginatedList<any>(projectsRes));
      
      const counts: Record<string, number> = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
      const tasksList = tasksRes.data || tasksRes || [];
      tasksList.forEach((t: any) => {
        const s = t.status || 'TODO';
        counts[s] = (counts[s] || 0) + 1;
      });
      setTaskCountByStatus(counts);

    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshAttendance = async () => {
    const res = await tmsApi.get<{ data: any }>('/attendance/daily-status');
    setTodayAttendance(res.data);
  };

  const handleClockAction = async () => {
    const isClockedIn = todayAttendance?.clockIn && !todayAttendance?.clockOut;
    if (todayAttendance?.clockOut) return;

    setClockLoading(true);
    try {
      if (isClockedIn) {
        await tmsApi.post('/attendance/clock-out');
        toast({ title: "Clocked out successfully" });
      } else {
        await tmsApi.post('/attendance/clock-in');
        toast({ title: "Clocked in successfully" });
      }
      await refreshAttendance();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update clock status",
        variant: "destructive"
      });
    } finally {
      setClockLoading(false);
    }
  };

  const handleBreakAction = async (action: 'break-start' | 'break-end') => {
    setBreakLoading(true);
    try {
      await tmsApi.post(`/attendance/${action}`);
      await refreshAttendance();
      toast({
        title: action === 'break-start' ? 'Break started' : 'Break ended',
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update break",
        variant: "destructive"
      });
    } finally {
      setBreakLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 animate-spin text-[#00A3FF]" />
      </div>
    );
  }

  const currentHours = todayAttendance?.totalHours || 0;
  const isClockedIn = todayAttendance?.clockIn && !todayAttendance?.clockOut;
  const isClockedOut = !!todayAttendance?.clockOut;
  const onBreak = isClockedIn && todayAttendance?.breakStart && !todayAttendance?.breakEnd;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold font-rajdhani tracking-wider text-stone-900 uppercase">
          Welcome back, {user?.profile?.firstName || user?.username}!
        </h1>
        <p className="text-stone-500 mt-1 text-sm">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Profile Stats */}
        <div className="bg-white border border-stone-200 shadow-sm p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold tracking-widest text-stone-400 uppercase mb-4">My Profile</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-[#EBF5FF] border border-[#00A3FF]/20 flex items-center justify-center text-xl font-bold text-[#00A3FF]">
                {(user?.profile?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-stone-900">{user?.profile?.firstName} {user?.profile?.lastName}</p>
                <p className="text-xs text-stone-400 uppercase tracking-wider mt-0.5">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-stone-50 p-4 rounded-xl border border-stone-100">
            <Clock className="w-4 h-4 text-[#00A3FF]" />
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider">Hours Today</p>
              <p className="text-lg font-bold text-stone-900">{currentHours.toFixed(1)}h</p>
            </div>
          </div>
        </div>

        {/* Time Tracking Widget */}
        <div className="bg-white border border-stone-200 shadow-sm p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <h3 className="text-xs font-semibold tracking-widest text-stone-400 uppercase mb-5 w-full text-left">Time Tracking</h3>

          <div className="relative w-28 h-28 mb-5">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#F0EDE8" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="45" fill="none" stroke="#00A3FF"
                className="transition-all duration-1000 ease-in-out"
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * Math.min(currentHours / 8, 1))}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-stone-900">{currentHours.toFixed(1)}</span>
              <span className="text-xs text-stone-400">/ 8h</span>
            </div>
          </div>

          <button
            onClick={handleClockAction}
            disabled={clockLoading || breakLoading || isClockedOut}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              isClockedOut ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
              : isClockedIn ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
              : 'bg-[#00A3FF] text-white hover:bg-[#0090e0] shadow-sm'
            }`}
          >
            {clockLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              isClockedOut ? 'Shift Completed' : isClockedIn ? 'Clock Out' : 'Clock In'
            )}
          </button>

          <div className="grid grid-cols-2 gap-2 w-full mt-2">
            <button
              type="button"
              onClick={() => handleBreakAction('break-start')}
              disabled={!isClockedIn || onBreak || isClockedOut || breakLoading || clockLoading}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                isClockedIn && !onBreak && !isClockedOut
                  ? 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100'
                  : 'bg-stone-50 text-stone-300 cursor-not-allowed border border-stone-100'
              }`}
            >
              {breakLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Coffee className="w-3 h-3" />}
              Break
            </button>
            <button
              type="button"
              onClick={() => handleBreakAction('break-end')}
              disabled={!onBreak || isClockedOut || breakLoading || clockLoading}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                onBreak && !isClockedOut
                  ? 'bg-[#EBF5FF] text-[#00A3FF] border border-[#00A3FF]/20 hover:bg-blue-100'
                  : 'bg-stone-50 text-stone-300 cursor-not-allowed border border-stone-100'
              }`}
            >
              {breakLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Clock className="w-3 h-3" />}
              Resume
            </button>
          </div>
          {onBreak && (
            <p className="text-xs text-amber-500 mt-2 font-medium">● On break</p>
          )}
        </div>

        {/* Tasks Summary */}
        <div className="bg-white border border-stone-200 shadow-sm p-6 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-semibold tracking-widest text-stone-400 uppercase">My Tasks</h3>
            <Link href="/employee/tasks" className="text-xs text-[#00A3FF] hover:text-[#0090e0] font-medium">View All →</Link>
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 flex flex-col justify-center">
              <p className="text-2xl font-bold text-stone-900 mb-0.5">{taskCountByStatus.TODO || 0}</p>
              <p className="text-xs text-stone-400 uppercase tracking-wider">To Do</p>
            </div>
            <div className="bg-[#EBF5FF] rounded-xl p-4 border border-[#00A3FF]/10 flex flex-col justify-center">
              <p className="text-2xl font-bold text-[#00A3FF] mb-0.5">{taskCountByStatus.IN_PROGRESS || 0}</p>
              <p className="text-xs text-[#00A3FF]/60 uppercase tracking-wider">In Progress</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex flex-col justify-center">
              <p className="text-2xl font-bold text-amber-600 mb-0.5">{taskCountByStatus.IN_REVIEW || 0}</p>
              <p className="text-xs text-amber-500/70 uppercase tracking-wider">In Review</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex flex-col justify-center">
              <p className="text-2xl font-bold text-emerald-600 mb-0.5">{taskCountByStatus.DONE || 0}</p>
              <p className="text-xs text-emerald-500/70 uppercase tracking-wider">Done</p>
            </div>
          </div>
        </div>

      </div>

      {/* Active Projects */}
      <div className="bg-white border border-stone-200 shadow-sm p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs font-semibold tracking-widest text-stone-400 uppercase">Active Projects</h3>
          <Link href="/employee/projects" className="text-xs text-[#00A3FF] hover:text-[#0090e0] font-medium">View All →</Link>
        </div>

        {activeProjects.length === 0 ? (
          <div className="text-center py-10 text-stone-400">
            <Briefcase className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No active projects assigned</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProjects.map((project: any) => {
              const taskCount = project._count?.tasks ?? project.taskCount ?? 0;
              const endRaw = project.end_date ?? project.endDate;
              return (
              <Link key={project.id} href={`/employee/projects/${project.id}`}>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 hover:bg-white hover:border-[#00A3FF]/30 hover:shadow-sm transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-stone-900 group-hover:text-[#00A3FF] transition-colors line-clamp-1 text-sm">{project.name}</h4>
                    <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-white border border-stone-200 text-stone-500 rounded-md">
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <div className="flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>{taskCount} tasks</span>
                    </div>
                    {endRaw && (
                      <span>Due {format(new Date(endRaw), 'MMM d, yyyy')}</span>
                    )}
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
