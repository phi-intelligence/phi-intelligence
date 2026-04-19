import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useEmployee } from '@/contexts/EmployeeContext';
import EmployeeDashboard from '@/pages/employee/EmployeeDashboard';
import EmployeeAdminDashboard from '@/pages/employee/admin/EmployeeAdminDashboard';

/**
 * /employee landing page.
 *
 * Admins are managers — they monitor the team and don't run their own
 * timesheet/clock-in flow — so we render the admin dashboard directly. Regular
 * employees and project leads see the personal dashboard.
 */
export default function EmployeeHome() {
  const { user, loading } = useEmployee();

  if (loading || !user) return null;
  if (user.role === 'ADMIN') return <EmployeeAdminDashboard />;
  return <EmployeeDashboard />;
}

/**
 * Wrap any "self-service" page (My Tasks, Timesheet, my Leaves, my clock-in,
 * Daily Report) so an admin who URL-navigates to it gets bounced
 * to the admin dashboard instead of seeing an irrelevant page.
 */
export function EmployeeOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useEmployee();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && user?.role === 'ADMIN') {
      setLocation('/employee');
    }
  }, [loading, user?.role, setLocation]);

  if (loading || !user) return null;
  if (user.role === 'ADMIN') return null;
  return <>{children}</>;
}

/** AI planner, new-project form, and other admin-only portal pages. */
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useEmployee();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && user && user.role !== 'ADMIN') {
      setLocation('/employee');
    }
  }, [loading, user, setLocation]);

  if (loading || !user) return null;
  if (user.role !== 'ADMIN') return null;
  return <>{children}</>;
}
