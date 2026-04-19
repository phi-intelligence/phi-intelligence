import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/employees/EmployeeList';
import AttendanceClock from './pages/attendance/AttendanceClock';
import AttendanceHistory from './pages/attendance/AttendanceHistory';
import AdminAttendance from './pages/attendance/AdminAttendance';
import LeaveHistory from './pages/leave/LeaveHistory';
import LeaveCalendar from './pages/leave/LeaveCalendar';
import AdminLeaveRequests from './pages/leave/AdminLeaveRequests';
import Leaves from './pages/leave/Leaves';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSettings from './pages/admin/AdminSettings';
import ProjectList from './pages/projects/ProjectList';
import ProjectForm from './pages/projects/ProjectForm';
import ProjectDetail from './pages/projects/ProjectDetail';
import TaskBoard from './pages/projects/TaskBoard';
import MyTasks from './pages/tasks/MyTasks';
import Timesheet from './pages/time/Timesheet';
import TimeApproval from './pages/time/TimeApproval';
import PlanPage from './pages/ai/PlanPage';
import ReportPage from './pages/ai/ReportPage';

import LoadingSpinner from './components/LoadingSpinner';
import { Toaster } from 'react-hot-toast';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<Dashboard />} />

        {/* Attendance */}
        <Route path="attendance">
          <Route path="clock" element={<AttendanceClock />} />
          <Route path="history" element={<AttendanceHistory />} />
          <Route
            path="admin"
            element={
              <PrivateRoute roles={['ADMIN', 'PROJECT_LEAD']}>
                <AdminAttendance />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Leave */}
        <Route path="leaves" element={<Leaves />} />
        <Route path="leave">
          <Route path="history" element={<LeaveHistory />} />
          <Route
            path="admin"
            element={
              <PrivateRoute roles={['ADMIN', 'PROJECT_LEAD']}>
                <AdminLeaveRequests />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Employees (Admin only) */}
        <Route
          path="employees"
          element={
            <PrivateRoute roles={['ADMIN']}>
              <EmployeeList />
            </PrivateRoute>
          }
        />

        {/* Projects */}
        <Route path="projects">
          <Route index element={<ProjectList />} />
          <Route path=":id" element={<ProjectDetail />} />
          <Route path=":id/tasks" element={<TaskBoard />} />
          <Route
            path="new"
            element={
              <PrivateRoute roles={['ADMIN', 'PROJECT_MANAGER']}>
                <ProjectForm />
              </PrivateRoute>
            }
          />
          <Route
            path=":id/edit"
            element={
              <PrivateRoute roles={['ADMIN', 'PROJECT_MANAGER']}>
                <ProjectForm />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Tasks */}
        <Route path="tasks">
          <Route path="my-tasks" element={<MyTasks />} />
        </Route>

        {/* Time Tracking */}
        <Route path="time">
          <Route path="timesheet" element={<Timesheet />} />
          <Route
            path="approvals"
            element={
              <PrivateRoute roles={['ADMIN', 'PROJECT_MANAGER', 'PROJECT_LEAD']}>
                <TimeApproval />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Admin */}
        <Route path="admin">
          <Route
            path="dashboard"
            element={
              <PrivateRoute roles={['ADMIN']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="settings"
            element={
              <PrivateRoute roles={['ADMIN']}>
                <AdminSettings />
              </PrivateRoute>
            }
          />
        </Route>

        {/* AI */}
        <Route path="ai">
          <Route
            path="plan"
            element={
              <PrivateRoute roles={['ADMIN', 'PROJECT_MANAGER', 'PROJECT_LEAD']}>
                <PlanPage />
              </PrivateRoute>
            }
          />
          <Route path="report" element={<ReportPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
    </>
  );
}

export default App;
