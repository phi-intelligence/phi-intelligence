import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectApi } from '../../services/projectApi';
import type { Project, ProjectStatus, Priority, Region } from '../../types/project';
import { PROJECT_STATUS_COLORS, PRIORITY_COLORS } from '../../types/project';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const ProjectList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
  const [regionFilter, setRegionFilter] = useState<Region | ''>('');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdminOrPM = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, priorityFilter, regionFilter, searchTerm]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const filters = {
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
        ...(regionFilter && { region: regionFilter }),
        ...(searchTerm && { search: searchTerm }),
      };
      const data = await projectApi.getProjects(filters);
      setProjects(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (project: Project): number => {
    if (!project._count?.tasks || project._count.tasks === 0) return 0;
    const completedTasks = projects.find((p) => p.id === project.id)?._count?.tasks || 0;
    return Math.round((completedTasks / project._count.tasks) * 100);
  };

  const formatDate = (date: string | undefined): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const activeProjects = projects.filter((p) => p.status === 'ACTIVE').length;
  const completedProjects = projects.filter((p) => p.status === 'COMPLETED').length;
  const totalProjects = projects.length;
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Projects</h1>
          <p className="text-text-secondary mt-1">Manage and track your projects</p>
        </div>
        {isAdminOrPM && (
          <button
            onClick={() => navigate('/projects/new')}
            className="btn btn-primary flex items-center gap-2"
          >
            <span>+</span>
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="text-sm text-text-secondary">Total Projects</div>
          <div className="text-2xl font-bold text-text-primary mt-1">{totalProjects}</div>
        </div>
        <div className="card">
          <div className="text-sm text-text-secondary">Active Projects</div>
          <div className="text-2xl font-bold text-accent-dark mt-1">{activeProjects}</div>
        </div>
        <div className="card">
          <div className="text-sm text-text-secondary">Completed</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{completedProjects}</div>
        </div>
        <div className="card">
          <div className="text-sm text-text-secondary">Completion Rate</div>
          <div className="text-2xl font-bold text-text-primary mt-1">{completionRate}%</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProjectStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="PLANNING">Planning</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as Priority)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Region</label>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value as Region)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Regions</option>
              <option value="UK">UK</option>
              <option value="INDIA">India</option>
              <option value="BOTH">Both</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-card mb-6">
          {error}
        </div>
      )}

      {/* Project Grid */}
      {projects.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-text-muted text-5xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-text-primary mb-2">No projects found</h3>
          <p className="text-text-secondary mb-4">
            {searchTerm || statusFilter || priorityFilter || regionFilter
              ? 'Try adjusting your filters'
              : 'Get started by creating your first project'}
          </p>
          {isAdminOrPM && !searchTerm && !statusFilter && (
            <button
              onClick={() => navigate('/projects/new')}
              className="btn btn-primary px-6 py-2"
            >
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="card hover:shadow-soft-lg transition-all cursor-pointer"
            >
              {/* Project Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">{project.name}</h3>
                  <p className="text-sm text-text-secondary">{project.projectCode}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${PROJECT_STATUS_COLORS[project.status]}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>

              {/* Project Description */}
              {project.description && (
                <p className="text-sm text-text-secondary mb-4 line-clamp-2">{project.description}</p>
              )}

              {/* Project Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <span className="text-text-muted w-24">Client:</span>
                  <span className="text-text-primary">{project.clientName || 'N/A'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-text-muted w-24">Lead:</span>
                  <span className="text-text-primary">
                    {project.projectLead
                      ? `${project.projectLead.firstName} ${project.projectLead.lastName}`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-text-muted w-24">Timeline:</span>
                  <span className="text-text-primary">
                    {formatDate(project.startDate)} - {formatDate(project.endDate)}
                  </span>
                </div>
              </div>

              {/* Priority & Region Badges */}
              <div className="flex gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[project.priority]}`}>
                  {project.priority}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  {project.region}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-secondary">Progress</span>
                  <span className="text-text-primary font-medium">{getProgressPercentage(project)}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${getProgressPercentage(project)}%` }}
                  ></div>
                </div>
              </div>

              {/* Footer Stats */}
              <div className="flex justify-between text-sm text-text-muted pt-4 border-t border-gray-100">
                <span>{project._count?.members || 0} members</span>
                <span>{project._count?.tasks || 0} tasks</span>
                <span>{project.actualHours || 0}h logged</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;





