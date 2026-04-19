import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectApi } from '../../services/projectApi';
import type { Project } from '../../types/project';
import LoadingSpinner from '../../components/LoadingSpinner';
import { PROJECT_STATUS_COLORS } from '../../types/project';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import ProjectMetrics from '../../components/projects/ProjectMetrics';
import ProjectOverview from '../../components/projects/ProjectOverview';
import ProjectTeam from '../../components/projects/ProjectTeam';
import ProjectTasks from '../../components/projects/ProjectTasks';
import ProjectTimeline from '../../components/projects/ProjectTimeline';

type TabType = 'overview' | 'team' | 'tasks' | 'timeline';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  const isAdminOrPM = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';
  const isProjectLead = project?.projectLeadId === user?.id;
  const canEdit = isAdminOrPM || isProjectLead;

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id, refreshKey]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await projectApi.getProjectById(id!);
      setProject(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await projectApi.deleteProject(id!);
      navigate('/projects');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-card">
          {error || 'Project not found'}
        </div>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 text-text-primary hover:text-blue-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>
      </div>
    );
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'team', label: 'Team' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'timeline', label: 'Timeline' },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center text-sm text-text-secondary">
        <Link to="/projects" className="hover:text-text-primary">
          Projects
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text-primary">{project.name}</span>
      </div>

      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-text-primary">{project.name}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${PROJECT_STATUS_COLORS[project.status]}`}>
              {project.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-text-secondary">
            {project.projectCode} • Led by{' '}
            {project.projectLead
              ? `${project.projectLead.firstName} ${project.projectLead.lastName}`
              : 'Unknown'}
          </p>
        </div>

        {canEdit && (
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/projects/${id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-text-secondary rounded-card hover:bg-gray-50 transition"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            {isAdminOrPM && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-card hover:bg-red-50 transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Metrics Cards */}
      <ProjectMetrics projectId={id!} refreshKey={refreshKey} />

      {/* Tabs as Pills */}
      <div className="mt-6">
        <nav className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pill ${
                activeTab === tab.id
                  ? 'bg-accent text-text-primary shadow-soft-lg'
                  : 'hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && <ProjectOverview project={project} />}
          {activeTab === 'team' && (
            <ProjectTeam projectId={id!} canEdit={canEdit} onUpdate={handleRefresh} />
          )}
          {activeTab === 'tasks' && <ProjectTasks projectId={id!} />}
          {activeTab === 'timeline' && <ProjectTimeline projectId={id!} />}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;





