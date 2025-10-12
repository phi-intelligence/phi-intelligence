import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdmin } from '@/contexts/AdminContext';
import StatusBadge from './StatusBadge';
import JobForm from './JobForm';

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface JobFormData {
  title: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  isActive: boolean;
}

export default function JobsTable() {
  const { accessToken } = useAdmin();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [accessToken]);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm]);

  const fetchJobs = async () => {
    if (!accessToken) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/jobs', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;
    
    if (searchTerm) {
      filtered = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredJobs(filtered);
  };

  const handleCreateJob = async (jobData: JobFormData) => {
    if (!accessToken) return;

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      if (response.ok) {
        await fetchJobs();
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateJob = async (jobData: JobFormData) => {
    if (!accessToken || !editingJob) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/jobs/${editingJob.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      if (response.ok) {
        await fetchJobs();
        setEditingJob(null);
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error updating job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!accessToken) return;

    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        await fetchJobs();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setShowForm(true);
  };

  const handleFormSubmit = (jobData: JobFormData) => {
    if (editingJob) {
      handleUpdateJob(jobData);
    } else {
      handleCreateJob(jobData);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
          <h2 className="text-2xl font-bold text-white">Job Postings</h2>
          <p className="text-muted-foreground">
            Manage your job postings and career opportunities
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Job
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-card/80 border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, location, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black border-border/50 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span>{filteredJobs.length} of {jobs.length} jobs</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader>
          <CardTitle className="text-white">All Job Postings</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No jobs match your search criteria.' : 'No job postings yet.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Job Posting
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{job.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <span>{job.location}</span>
                          <span>•</span>
                          <span>{job.type}</span>
                          <span>•</span>
                          <span>Created {formatDate(job.createdAt)}</span>
                        </div>
                        <div className="mt-2">
                          <StatusBadge 
                            status={job.isActive ? 'active' : 'inactive'} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditJob(job)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteJob(job.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Form Modal */}
      {showForm && (
        <JobForm
          job={editingJob || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingJob(null);
          }}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}
