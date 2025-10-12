import React, { useState, useEffect } from 'react';
import { useLocation, Route, Switch } from 'wouter';
import { Menu, X, LogOut, User, Bell, Settings, BarChart3, Users, Briefcase, FileText, Mic, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/contexts/AdminContext';
import AdminDashboard from './AdminDashboard';
import JobsTable from './components/JobsTable';
import ContactsTable from './components/ContactsTable';
import ApplicationsTable from './components/ApplicationsTable';


// Navigation items for admin sidebar
const navItems = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    description: 'Overview and statistics'
  },
  {
    href: '/admin/contacts',
    label: 'Contacts',
    icon: Users,
    description: 'Manage business inquiries'
  },
  {
    href: '/admin/applications',
    label: 'Applications',
    icon: FileText,
    description: 'Review job applications'
  },
  {
    href: '/admin/jobs',
    label: 'Job Postings',
    icon: Briefcase,
    description: 'Manage job positions'
  },

  {
    href: '/admin/settings',
    label: 'Settings',
    icon: Settings,
    description: 'System configuration'
  }
];

export default function AdminLayout() {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAuthenticated, isLoading } = useAdmin();
  const [, setLocation] = useLocation();

  // Authentication check - redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/admin/login');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleLogout = () => {
    logout();
    // Redirect to login page
    window.location.href = '/admin/login';
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Show loading state during authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Verifying Access</h2>
          <p className="text-gray-400">Please wait while we verify your authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">You are not authorized to access this area.</p>
          <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">Φ</span>
            </div>
            <div>
              <h1 className="font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-sidebar-foreground">Phi Intelligence</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden text-sidebar-foreground hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <a
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-70">{item.description}</div>
                </div>
              </a>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-sidebar-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.username || 'Admin'}
              </p>
              <p className="text-xs text-sidebar-foreground truncate">
                {user?.email || 'admin@phiintelligence.com'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-sidebar-foreground hover:text-white hover:bg-sidebar-accent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="lg:hidden text-foreground hover:bg-accent"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  {navItems.find(item => item.href === location)?.label || 'Admin Panel'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {navItems.find(item => item.href === location)?.description || 'Manage your business'}
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Switch>
            <Route path="/admin/dashboard" component={AdminDashboard} />
            <Route path="/admin/contacts">
              <ContactsTable />
            </Route>
            <Route path="/admin/applications">
              <ApplicationsTable />
            </Route>
            <Route path="/admin/jobs">
              <JobsTable />
            </Route>

            <Route path="/admin/settings">
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold mb-4">Settings</h2>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </Route>
            <Route path="/admin">
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold mb-4">Welcome to Admin Panel</h2>
                <p className="text-muted-foreground">Select a section from the sidebar to get started.</p>
              </div>
            </Route>
          </Switch>
        </main>
      </div>
    </div>
  );
}
