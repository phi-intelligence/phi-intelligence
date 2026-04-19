import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { projectApi } from '@/services/projectApi';
import { taskApi } from '@/services/taskApi';
import { Attendance, ApiResponse } from '@/types';
import type { Project } from '@/types/project';
import { ProjectStatus } from '@/types/project';
import type { Task } from '@/types/task';
import { Clock, Briefcase, CheckSquare } from 'lucide-react';
import { formatDate, formatTime, formatHours } from '@/utils/formatters';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusBadge from '@/components/StatusBadge';
import ProfileCard from '@/components/dashboard/ProfileCard';
import CircularProgress from '@/components/dashboard/CircularProgress';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [taskCountByStatus, setTaskCountByStatus] = useState<Record<string, number>>({
    TODO: 0,
    IN_PROGRESS: 0,
    IN_REVIEW: 0,
    DONE: 0,
  });
  const [projectsTasksLoading, setProjectsTasksLoading] = useState(true);
  const [projectsTasksError, setProjectsTasksError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const attendanceRes = await api.get<ApiResponse<Attendance | null>>('/attendance/daily-status');
      setTodayAttendance(attendanceRes.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const fetchProjectsAndTasks = useCallback(async () => {
    if (!user) return;
    setProjectsTasksLoading(true);
    setProjectsTasksError(null);
    try {
      const [projects, tasks] = await Promise.all([
        projectApi.getProjects({ status: ProjectStatus.ACTIVE }, 1, 10),
        taskApi.getMyTasks(),
      ]);
      setActiveProjects(projects);
      const counts: Record<string, number> = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
      (tasks as Task[]).forEach((t) => {
        const s = t.status ?? 'TODO';
        if (counts[s] !== undefined) counts[s]++;
        else counts[s] = 1;
      });
      setTaskCountByStatus(counts);
    } catch (error) {
      console.error('Failed to fetch projects/tasks:', error);
      const message = error && typeof error === 'object' && 'message' in error
        ? String((error as { message: string }).message)
        : 'Could not load projects and tasks. Check that the backend is running.';
      setProjectsTasksError(message);
      toast.error(message);
    } finally {
      setProjectsTasksLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProjectsAndTasks();
  }, [fetchProjectsAndTasks]);

  const handleClockAction = async () => {
    const isClockedIn = todayAttendance?.clockIn && !todayAttendance?.clockOut;
    if (todayAttendance?.clockOut) {
      return; // already clocked out, show "View" only
    }
    setClockLoading(true);
    try {
      if (isClockedIn) {
        await api.post('/attendance/clock-out');
        toast.success('Clocked out');
      } else {
        await api.post('/attendance/clock-in');
        toast.success('Clocked in');
      }
      const res = await api.get<ApiResponse<Attendance | null>>('/attendance/daily-status');
      setTodayAttendance(res.data.data);
    } catch (error) {
      // toast handled by api interceptor
    } finally {
      setClockLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const currentHours = todayAttendance?.totalHours || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">
          Welcome back, {user?.profile?.firstName}!
        </h1>
        <p className="text-text-secondary mt-1">
          {formatDate(new Date().toISOString(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Top row: Profile, Today's Time, My Tasks */}
      <div className="grid grid-cols-12 gap-6">
        {/* Profile Card */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
          <ProfileCard
            firstName={user?.profile?.firstName}
            lastName={user?.profile?.lastName}
            role={user?.role}
            location={user?.profile?.location}
            stats={[
              { label: 'Hours today', value: Math.round(currentHours), icon: Clock },
            ]}
          />
        </div>

        {/* Today's Attendance with Circular Progress */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
          <div className="card h-full flex flex-col items-center justify-center">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-text-primary mb-2 text-center">
                Today's Time
              </h3>
              <CircularProgress percentage={currentHours / 8 * 100}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-text-primary">
                    {formatHours(currentHours)}
                  </div>
                  <div className="text-xs text-text-muted">hours</div>
                </div>
              </CircularProgress>
            </div>
            
            {todayAttendance && (
              <div className="w-full space-y-2 text-center">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">In:</span>
                  <span className="font-medium text-text-primary">
                    {todayAttendance.clockIn ? formatTime(todayAttendance.clockIn) : '-'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Out:</span>
                  <span className="font-medium text-text-primary">
                    {todayAttendance.clockOut ? formatTime(todayAttendance.clockOut) : '-'}
                  </span>
                </div>
                <StatusBadge status={todayAttendance.status} />
              </div>
            )}
            
            {todayAttendance?.clockOut ? (
              <Link to="/attendance/clock" className="mt-4 btn btn-primary w-full text-center">
                View attendance
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleClockAction}
                disabled={clockLoading}
                className="mt-4 btn btn-primary w-full text-center disabled:opacity-50"
              >
                {clockLoading ? (
                  <LoadingSpinner size="sm" className="inline mr-2" />
                ) : null}
                {todayAttendance?.clockIn ? 'Clock Out' : 'Clock In'}
              </button>
            )}
          </div>
        </div>

        {/* My Tasks - top row */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
          <div className="card h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-text-secondary" />
                <h3 className="text-lg font-semibold text-text-primary">My Tasks</h3>
              </div>
              <Link to="/tasks/my-tasks" className="text-sm text-text-secondary hover:text-accent-dark">
                View all
              </Link>
            </div>
            {projectsTasksLoading ? (
              <div className="flex items-center justify-center py-6">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].map((status) => (
                  <div key={status} className="text-center p-3 bg-gray-50 rounded-card">
                    <div className="text-2xl font-bold text-text-primary">{taskCountByStatus[status] ?? 0}</div>
                    <div className="text-xs text-text-muted">{status.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row: Active Projects only */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-text-secondary" />
                <h3 className="text-lg font-semibold text-text-primary">Active Projects</h3>
              </div>
              <Link to="/projects" className="text-sm text-text-secondary hover:text-accent-dark">
                View all
              </Link>
            </div>
            {projectsTasksLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : projectsTasksError ? (
              <div className="text-center py-8 text-amber-600 dark:text-amber-400">
                <p>{projectsTasksError}</p>
                <p className="text-sm text-text-muted mt-1">Ensure the backend is running (e.g. port 5000).</p>
              </div>
            ) : activeProjects.length > 0 ? (
              <ul className="space-y-2">
                {activeProjects.slice(0, 10).map((project) => (
                  <li key={project.id}>
                    <Link
                      to={`/projects/${project.id}/tasks`}
                      className="block p-2 rounded-card hover:bg-gray-50 text-text-primary font-medium"
                    >
                      {project.name}
                      {project.projectCode ? (
                        <span className="text-text-muted text-sm ml-1">({project.projectCode})</span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-text-muted">
                <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No active projects</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;





