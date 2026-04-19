import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useEmployee } from '@/contexts/EmployeeContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Clock,
  Calendar,
  CheckSquare,
  FolderKanban,
  Timer,
  ClipboardCheck,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Sparkles,
  FileText,
  BarChart3,
} from 'lucide-react';

type NavItem = {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
};

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useEmployee();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isProjectLead = user?.role === 'PROJECT_LEAD';

  // Admins are managers, not workers. They oversee the team — assign work,
  // monitor progress, review attendance/leaves/reports — and don't need the
  // "self-service" pages (My Tasks, my clock-in, my leaves, timesheet, daily
  // report). AI planner and creating new projects are admin-only. Project
  // leads still use the employee pages because they execute work themselves.
  const employeeNavItems: NavItem[] = [
    { name: 'Dashboard', href: '/employee', icon: LayoutDashboard },
    { name: 'Attendance', href: '/employee/attendance', icon: Clock },
    { name: 'Leaves', href: '/employee/leaves', icon: Calendar },
    { name: 'My Tasks', href: '/employee/tasks', icon: CheckSquare },
    { name: 'Projects', href: '/employee/projects', icon: FolderKanban },
    { name: 'Timesheet', href: '/employee/timesheet', icon: Timer },
    { name: 'Daily report', href: '/employee/ai/report', icon: FileText },
  ];

  const adminWorkspaceItems: NavItem[] = [
    { name: 'Dashboard', href: '/employee', icon: LayoutDashboard },
    { name: 'Employees', href: '/employee/admin/employees', icon: Users },
    { name: 'Projects', href: '/employee/projects', icon: FolderKanban },
    { name: 'AI planner', href: '/employee/ai/plan', icon: Sparkles },
    { name: 'Attendance', href: '/employee/attendance/admin', icon: Clock },
    { name: 'Leave & timesheet approvals', href: '/employee/approvals', icon: ClipboardCheck },
    { name: 'Daily reports', href: '/employee/admin/reports', icon: FileText },
    { name: 'Analytics', href: '/employee/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/employee/admin/settings', icon: Settings },
  ];

  // Project leads see employee nav + a smaller management section (no
  // org-wide settings or employee directory).
  const projectLeadManagementItems: NavItem[] = [
    { name: 'Attendance report', href: '/employee/attendance/admin', icon: Clock },
    { name: 'Approvals', href: '/employee/approvals', icon: ClipboardCheck },
    { name: 'Daily reports', href: '/employee/admin/reports', icon: FileText },
    { name: 'Analytics', href: '/employee/admin/analytics', icon: BarChart3 },
  ];

  const primaryNav: NavItem[] = isAdmin ? adminWorkspaceItems : employeeNavItems;
  const secondaryNav: NavItem[] = isAdmin
    ? []
    : isProjectLead
      ? projectLeadManagementItems
      : [];
  const secondaryNavLabel = isProjectLead ? 'Management' : '';

  const isItemActive = (item: NavItem) => {
    if (item.href === '/employee') return location === '/employee';
    if (item.href === '/employee/attendance') {
      return (
        location === '/employee/attendance' ||
        location.startsWith('/employee/attendance/history')
      );
    }
    if (item.href === '/employee/approvals') return location === '/employee/approvals';
    return location === item.href || location.startsWith(item.href + '/');
  };

  const renderNavGroup = (items: NavItem[], onClick?: () => void) =>
    items.map((item) => {
      const isActive = isItemActive(item);
      return (
        <Link key={item.name + item.href} href={item.href} onClick={onClick}>
          <div
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group',
              isActive
                ? 'bg-[#EBF5FF] text-[#00A3FF]'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50',
            )}
          >
            <item.icon
              className={cn(
                'w-4 h-4 transition-colors flex-shrink-0',
                isActive ? 'text-[#00A3FF]' : 'text-stone-400 group-hover:text-stone-700',
              )}
            />
            <span className="font-medium text-sm">{item.name}</span>
          </div>
        </Link>
      );
    });

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {renderNavGroup(primaryNav, onClick)}
      {secondaryNav.length > 0 && (
        <>
          <div className="pt-5 pb-2 px-3">
            <p className="text-[10px] font-semibold tracking-[0.15em] text-stone-400 uppercase">
              {secondaryNavLabel}
            </p>
          </div>
          {renderNavGroup(secondaryNav, onClick)}
        </>
      )}
    </>
  );

  return (
    <div
      data-tms-portal
      className="min-h-screen bg-[hsl(var(--tms-canvas))] text-stone-900 font-inter flex flex-col md:flex-row relative"
    >

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-stone-200 h-screen sticky top-0 z-20 shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <img src="/assets/logophi.png" alt="Phi Logo" className="w-8 h-8 filter brightness-0" />
            <span className="text-xl font-bold font-rajdhani tracking-widest uppercase text-stone-900">Portal</span>
          </div>
          <nav className="flex-1 space-y-1">
            <NavLinks />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-stone-100">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full text-left text-stone-500 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-all group">
            <LogOut className="w-5 h-5 group-hover:text-red-500 transition-colors" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Header - Mobile */}
      <header className="md:hidden bg-white border-b border-stone-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/assets/logophi.png" alt="Phi Logo" className="w-6 h-6 filter brightness-0" />
          <span className="text-lg font-bold font-rajdhani tracking-widest uppercase text-stone-900">Portal</span>
        </div>
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-stone-600 hover:text-stone-900">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col">
          <div className="p-4 flex justify-between items-center border-b border-stone-100">
            <div className="flex items-center gap-3">
              <img src="/assets/logophi.png" alt="Phi Logo" className="w-6 h-6 filter brightness-0" />
              <span className="text-lg font-bold font-rajdhani tracking-widest uppercase text-stone-900">Portal</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-stone-600 hover:text-stone-900">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-1">
            <NavLinks onClick={() => setMobileMenuOpen(false)} />
          </div>
          <div className="p-6 border-t border-stone-100">
            <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 w-full text-left text-stone-500 hover:text-stone-900 rounded-xl">
              <LogOut className="w-5 h-5 text-red-500" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 z-10 relative">
        {/* Topbar */}
        <div className="h-16 border-b border-stone-200 flex items-center justify-between px-6 md:px-10 bg-white shadow-sm">
          <h1 className="text-base font-semibold text-stone-800 hidden md:block">
            {primaryNav.find(isItemActive)?.name ||
              secondaryNav.find(isItemActive)?.name ||
              'Workspace'}
          </h1>

          <div className="flex items-center gap-4 ml-auto">
            <button className="relative text-stone-400 hover:text-stone-700 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#00A3FF] rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-stone-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-stone-800">{user?.profile?.firstName || user?.username}</p>
                <p className="text-xs text-stone-400 tracking-wider uppercase">{user?.role?.replace('_', ' ')}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#EBF5FF] border border-[#00A3FF]/20 flex items-center justify-center text-[#00A3FF] font-bold text-sm">
                {(user?.profile?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6 md:p-8 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
