import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Clock,
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  FolderKanban,
  CheckSquare,
  Timer,
  ClipboardCheck,
  Bell,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isProjectLead = user?.role === 'PROJECT_LEAD';

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, roles: ['ALL'] },
    { name: 'Projects', href: '/projects', icon: FolderKanban, roles: ['ALL'] },
    { name: 'Tasks', href: '/tasks/my-tasks', icon: CheckSquare, roles: ['ALL'] },
    { name: 'Timesheet', href: '/time/timesheet', icon: Timer, roles: ['ALL'] },
    { name: 'Attendance', href: '/attendance/clock', icon: Clock, roles: ['ALL'] },
    { name: 'Leaves', href: '/leaves', icon: Calendar, roles: ['ALL'] },
    { name: 'AI Plan', href: '/ai/plan', icon: Sparkles, roles: ['ADMIN', 'PROJECT_MANAGER', 'PROJECT_LEAD'] },
    { name: 'Daily Report', href: '/ai/report', icon: ClipboardCheck, roles: ['ALL'] },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Employees', href: '/employees', icon: Users },
    { name: 'Attendance Reports', href: '/attendance/admin', icon: Clock },
    { name: 'Leave Approvals', href: '/leave/admin', icon: Calendar },
    { name: 'Time Approvals', href: '/time/approvals', icon: ClipboardCheck },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="min-h-screen">
      {/* Horizontal Header */}
      <header className="sticky top-0 z-20 px-6 py-4">
        <div className="card flex items-center justify-between">
          {/* Logo */}
          <div className="text-xl font-bold text-text-primary">Phi-TMS</div>
          
          {/* Top navbar: pages the current user can access (role-filtered) */}
          <nav className="hidden lg:flex items-center gap-2" aria-label="Main navigation">
            {navigation
              .filter((item) => {
                if (!item.roles) return true;
                if (item.roles.includes('ALL')) return true;
                return user?.role && item.roles.includes(user.role);
              })
              .map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'pill flex items-center gap-2 transition-all',
                    isActive(item.href)
                      ? 'bg-accent text-text-primary shadow-soft-lg'
                      : 'hover:bg-gray-50'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
          </nav>
          
          {/* Icon Buttons */}
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Notifications */}
            <button className="hidden md:block p-2 rounded-full hover:bg-gray-100 transition-colors relative">
              <Bell className="w-5 h-5 text-text-secondary" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full"></span>
            </button>
            
            {/* User profile */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-text-primary font-semibold text-sm">
                {user?.profile?.firstName?.[0] || 'U'}
              </div>
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-text-primary">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </div>
                <div className="text-xs text-text-muted">{user?.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-80 flex-col bg-white shadow-soft-lg">
            <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100">
              <span className="text-xl font-bold text-text-primary">Phi-TMS</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6 text-text-secondary" />
              </button>
            </div>
            <SidebarContent
              navigation={navigation}
              adminNavigation={isAdmin || isProjectLead ? adminNavigation : []}
              isActive={isActive}
              isAdmin={isAdmin}
              isProjectLead={isProjectLead}
              user={user}
              handleLogout={handleLogout}
              onNavigate={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main content with full width */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

const SidebarContent = ({
  navigation,
  adminNavigation,
  isActive,
  isAdmin,
  isProjectLead,
  user,
  handleLogout,
  onNavigate,
}: any) => {
  const visibleNav = navigation.filter((item: any) => {
    if (!item.roles) return true;
    if (item.roles.includes('ALL')) return true;
    return user?.role && item.roles.includes(user.role);
  });

  return (
    <div className="flex flex-col flex-grow overflow-y-auto">
      <nav className="flex-1 px-4 py-6 space-y-2" aria-label="Main navigation">
        {visibleNav.map((item: any) => (
          <Link
            key={item.name}
            to={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center px-4 py-3 text-sm font-medium rounded-card transition-all',
              isActive(item.href)
                ? 'bg-accent text-text-primary shadow-soft'
                : 'text-text-secondary hover:bg-gray-50'
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        ))}

        {(isAdmin || isProjectLead) && adminNavigation.length > 0 && (
          <>
            <div className="px-4 pt-4 pb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
              {isAdmin ? 'Admin' : 'Management'}
            </div>
            {adminNavigation.map((item: any) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-card transition-all',
                  isActive(item.href)
                    ? 'bg-accent text-text-primary shadow-soft'
                    : 'text-text-secondary hover:bg-gray-50'
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-text-secondary rounded-card hover:bg-gray-50 transition-all"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Layout;

