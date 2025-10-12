import React, { useState, useEffect } from 'react';
import { Edit, Search, Filter, Download, Eye, Calendar, User, Star, FileText, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin } from '@/contexts/AdminContext';
import StatusBadge from './StatusBadge';
import ApplicationForm from './ApplicationForm';
import ResumeViewer from './ResumeViewer';

interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  personalInfo: string;
  experience: string;
  education: string;
  skills: string[];
  coverLetter: string;
  resumeUrl: string;
  status: string;
  notes?: string;
  priority: string;
  rating?: number;
  assignedTo?: string;
  interviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApplicationFormData {
  status: string;
  priority: string;
  notes: string;
  assignedTo: string;
  rating: number;
  interviewDate?: string;
}

export default function ApplicationsTable() {
  const { accessToken } = useAdmin();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResumeViewer, setShowResumeViewer] = useState(false);
  const [viewingResume, setViewingResume] = useState<{ url: string; name: string } | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: '',
    search: '',
    startDate: '',
    endDate: '',
    rating: ''
  });

  // Pagination states
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchApplications();
  }, [accessToken, pagination.page, pagination.limit]);

  useEffect(() => {
    filterApplications();
  }, [applications, filters]);

  const fetchApplications = async () => {
    if (!accessToken) return;

    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.assignedTo && { assignedTo: filters.assignedTo }),
        ...(filters.search && { search: filters.search }),
        ...(filters.startDate && filters.endDate && { 
          startDate: filters.startDate,
          endDate: filters.endDate 
        }),
        ...(filters.rating && { rating: filters.rating })
      });

      const response = await fetch(`/api/admin/applications?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
        setPagination(prev => ({
          ...prev,
          total: data.total || 0,
          totalPages: data.totalPages || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;
    
    if (filters.search) {
      filtered = filtered.filter(application =>
        (application.jobTitle || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (parsePersonalInfo(application.personalInfo).name || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (parsePersonalInfo(application.personalInfo).email || '').toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    setFilteredApplications(filtered);
  };

  const handleUpdateApplication = async (applicationData: ApplicationFormData) => {
    if (!accessToken || !editingApplication) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/applications/${editingApplication.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      if (response.ok) {
        await fetchApplications();
        setEditingApplication(null);
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error updating application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditApplication = (application: JobApplication) => {
    setEditingApplication(application);
    setShowForm(true);
  };

  const handleViewResume = (application: JobApplication) => {
    const personalInfo = parsePersonalInfo(application.personalInfo);
    const fileName = `${personalInfo.name || 'Candidate'}_Resume.${application.resumeUrl.split('.').pop() || 'pdf'}`;
    setViewingResume({ url: application.resumeUrl, name: fileName });
    setShowResumeViewer(true);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      assignedTo: '',
      search: '',
      startDate: '',
      endDate: '',
      rating: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const exportApplications = () => {
    const csvContent = [
      ['Candidate', 'Email', 'Position', 'Status', 'Priority', 'Rating', 'Assigned To', 'Applied Date', 'Interview Date', 'Notes'],
      ...filteredApplications.map(application => {
        const personalInfo = parsePersonalInfo(application.personalInfo);
        return [
          personalInfo.name || 'N/A',
          personalInfo.email || 'N/A',
          application.jobTitle || 'N/A',
          application.status || 'new',
          application.priority || 'medium',
          application.rating || 'No Rating',
          application.assignedTo || 'Unassigned',
          application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'N/A',
          application.interviewDate ? new Date(application.interviewDate).toLocaleDateString() : 'Not Scheduled',
          application.notes || ''
        ];
      })
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parsePersonalInfo = (personalInfo: string) => {
    try {
      const parsed = JSON.parse(personalInfo);
      return {
        name: parsed?.name || 'N/A',
        email: parsed?.email || 'N/A',
        phone: parsed?.phone || 'N/A'
      };
    } catch {
      return { name: 'N/A', email: 'N/A', phone: 'N/A' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderRating = (rating?: number) => {
    if (!rating || rating === 0) {
      return <span className="text-muted-foreground text-sm">No Rating</span>;
    }

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Job Applications</h2>
          <p className="text-muted-foreground">
            Manage and review all job applications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={exportApplications}
            variant="outline"
            className="border-border/50 text-white hover:bg-accent"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by candidate name, email, or job title..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 bg-black border-border/50 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange('status', value === "all" ? "" : value)}>
              <SelectTrigger className="bg-black border-border/50 text-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-white">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="interviewing">Interviewing</SelectItem>
                <SelectItem value="offered">Offered</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority || "all"} onValueChange={(value) => handleFilterChange('priority', value === "all" ? "" : value)}>
              <SelectTrigger className="bg-black border-border/50 text-white">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-white">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.rating || "all"} onValueChange={(value) => handleFilterChange('rating', value === "all" ? "" : value)}>
              <SelectTrigger className="bg-black border-border/50 text-white">
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-white">
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="2">2+ Stars</SelectItem>
                <SelectItem value="1">1+ Stars</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.assignedTo || "all"} onValueChange={(value) => handleFilterChange('assignedTo', value === "all" ? "" : value)}>
              <SelectTrigger className="bg-black border-border/50 text-white">
                <SelectValue placeholder="All Assignees" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-white">
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                <SelectItem value="technical_lead">Technical Lead</SelectItem>
                <SelectItem value="recruiter">Recruiter</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={clearFilters}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-white"
            >
              Clear Filters
            </Button>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white mb-2 block">Start Date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="bg-black border-border/50 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-white mb-2 block">End Date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="bg-black border-border/50 text-white"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredApplications.length} of {pagination.total} applications
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader>
          <CardTitle className="text-white">All Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {Object.values(filters).some(f => f) ? 'No applications match your filters.' : 'No applications yet.'}
              </p>
              {Object.values(filters).some(f => f) && (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => {
                const personalInfo = parsePersonalInfo(application.personalInfo);
                
                return (
                  <div
                    key={application.id}
                    className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                                                     <div className="flex items-center gap-2 mb-2">
                             <h3 className="font-semibold text-white truncate">{personalInfo.name || 'N/A'}</h3>
                             <StatusBadge status={application.status || 'new'} />
                             <StatusBadge status={application.priority || 'medium'} />
                           </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                <span>{application.jobTitle}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>{personalInfo.email || 'N/A'}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Applied {formatDate(application.createdAt)}</span>
                              </div>
                              {application.interviewDate && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>Interview {formatDateTime(application.interviewDate)}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Skills */}
                          {application.skills && application.skills.length > 0 && (
                            <div className="mt-2">
                              <div className="flex flex-wrap gap-1">
                                {application.skills.slice(0, 5).map((skill, index) => (
                                  <span 
                                    key={index}
                                    className="px-2 py-1 bg-muted/30 rounded text-xs text-white border border-border/50"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {application.skills.length > 5 && (
                                  <span className="px-2 py-1 bg-muted/30 rounded text-xs text-muted-foreground border border-border/50">
                                    +{application.skills.length - 5} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Rating and Notes */}
                          <div className="mt-2 flex items-center gap-4">
                            {renderRating(application.rating)}
                            {application.notes && (
                              <div className="text-sm text-muted-foreground">
                                <strong>Notes:</strong> {application.notes.length > 100 
                                  ? `${application.notes.substring(0, 100)}...` 
                                  : application.notes
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditApplication(application)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewResume(application)}
                        className="text-green-400 hover:text-green-300 hover:bg-green-500/20"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page <= 1}
            className="border-border/50 text-white hover:bg-accent"
          >
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page >= pagination.totalPages}
            className="border-border/50 text-white hover:bg-accent"
          >
            Next
          </Button>
        </div>
      )}

      {/* Application Form Modal */}
      {showForm && editingApplication && (
        <ApplicationForm
          application={editingApplication}
          onSubmit={handleUpdateApplication}
          onCancel={() => {
            setShowForm(false);
            setEditingApplication(null);
          }}
          isLoading={isSubmitting}
        />
      )}

      {/* Resume Viewer Modal */}
      {showResumeViewer && viewingResume && (
        <ResumeViewer
          resumeUrl={viewingResume.url}
          fileName={viewingResume.name}
          onClose={() => {
            setShowResumeViewer(false);
            setViewingResume(null);
          }}
        />
      )}
    </div>
  );
}
