import React, { useState, useEffect } from 'react';
import { Users, FileText, Briefcase, BarChart3, TrendingUp, Clock, AlertCircle, CheckCircle, Plus, Eye, Mic, Bot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/contexts/AdminContext';
import { useLocation } from 'wouter';

interface DashboardStats {
  contacts: number;
  applications: number;
  jobs: number;
  blogPosts: number;
  voiceSessions: number;
  activeVoicebots: number;
}

interface RecentActivity {
  id: string;
  type: 'contact' | 'application' | 'job';
  title: string;
  description: string;
  timestamp: string;
  status: string;
}

export default function AdminDashboard() {
  const { accessToken } = useAdmin();
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState<DashboardStats>({
    contacts: 0,
    applications: 0,
    jobs: 0,
    blogPosts: 0,
    voiceSessions: 0,
    activeVoicebots: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [accessToken]);

  const fetchDashboardData = async () => {
    if (!accessToken) return;

    try {
      setIsLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      // Fetch recent contacts
      const contactsResponse = await fetch('/api/admin/contacts?limit=5', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      let contactActivities: RecentActivity[] = [];
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        contactActivities = contactsData.contacts.slice(0, 3).map((contact: any) => ({
          id: contact.id,
          type: 'contact',
          title: contact.name,
          description: `${contact.company || 'No company'} - ${contact.service || 'General inquiry'}`,
          timestamp: contact.createdAt,
          status: contact.status || 'new'
        }));
      }

      // Fetch recent applications
      const applicationsResponse = await fetch('/api/admin/applications?limit=3', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      let applicationActivities: RecentActivity[] = [];
      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        applicationActivities = applicationsData.applications.slice(0, 2).map((application: any) => ({
          id: application.id,
          type: 'application',
          title: `Application for ${application.jobTitle || 'Unknown Position'}`,
          description: `New application received`,
          timestamp: application.createdAt,
          status: application.status || 'new'
        }));
      }
      
      // Combine and sort activities by timestamp
      const allActivities = [...contactActivities, ...applicationActivities]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);
      
      setRecentActivity(allActivities);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
      case 'contacted':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'qualified':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'converted':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'contacted':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'qualified':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'converted':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'reviewing':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'interviewing':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'offered':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  // Navigation functions
  const navigateToContacts = () => setLocation('/admin/contacts');
  const navigateToApplications = () => setLocation('/admin/applications');
  const navigateToJobs = () => setLocation('/admin/jobs');
  const navigateToAnalytics = () => setLocation('/admin/analytics');


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-card/80">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-card to-card/50 rounded-lg p-6 border border-border">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Admin!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {/* Contacts Card */}
        <Card className="bg-card/80 hover:bg-card/90 transition-all duration-300 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Contacts</p>
                <p className="text-3xl font-bold text-white">{stats.contacts}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-400 hover:text-blue-300"
                onClick={navigateToContacts}
              >
                View All →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications Card */}
        <Card className="bg-card/80 hover:bg-card/90 transition-all duration-300 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Job Applications</p>
                <p className="text-3xl font-bold text-white">{stats.applications}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="mt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-green-400 hover:text-green-300"
                onClick={navigateToApplications}
              >
                Review All →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Card */}
        <Card className="bg-card/80 hover:bg-card/90 transition-all duration-300 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                <p className="text-3xl font-bold text-white">{stats.jobs}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-purple-400 hover:text-purple-300"
                onClick={navigateToJobs}
              >
                Manage Jobs →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Blog Posts Card */}
        <Card className="bg-card/80 hover:bg-card/90 transition-all duration-300 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Blog Posts</p>
                <p className="text-3xl font-bold text-white">{stats.blogPosts}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-400" />
              </div>
            </div>
            <div className="mt-4">
              <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300">
                View Posts →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Voice Sessions Card */}
        <Card className="bg-card/80 hover:bg-card/90 transition-all duration-300 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Voice Sessions</p>
                <p className="text-3xl font-bold text-white">{stats.voiceSessions}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <Mic className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div className="mt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-indigo-400 hover:text-indigo-300"
                disabled
              >
                LiveKit Cloud →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Voicebots Card */}
        <Card className="bg-card/80 hover:bg-card/90 transition-all duration-300 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Voicebots</p>
                <p className="text-3xl font-bold text-white">{stats.activeVoicebots}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div className="mt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-emerald-400 hover:text-emerald-300"
                disabled
              >
                LiveKit Cloud →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription>Latest business inquiries and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                    {getStatusIcon(activity.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-white"
                      onClick={() => {
                        if (activity.type === 'contact') navigateToContacts();
                        if (activity.type === 'application') navigateToApplications();
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                onClick={navigateToContacts}
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Contacts
              </Button>
              <Button 
                className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
                onClick={navigateToJobs}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Manage Job Postings
              </Button>
              <Button 
                className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white"
                onClick={navigateToApplications}
              >
                <FileText className="w-4 h-4 mr-2" />
                Review Applications
              </Button>
              <Button 
                className="w-full justify-start bg-orange-600 hover:bg-orange-700 text-white"
                onClick={navigateToAnalytics}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
