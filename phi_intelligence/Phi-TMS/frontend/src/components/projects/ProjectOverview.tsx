import type { Project } from '../../types/project';
import { PRIORITY_COLORS } from '../../types/project';
import { Calendar, User, MapPin, Flag, DollarSign, Clock } from 'lucide-react';

interface ProjectOverviewProps {
  project: Project;
}

const ProjectOverview = ({ project }: ProjectOverviewProps) => {
  const formatDate = (date: string | undefined): string => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const calculateDaysRemaining = (): number | null => {
    if (!project.endDate) return null;
    const end = new Date(project.endDate);
    const today = new Date();
    const diff = end.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const calculateProgress = (): number => {
    if (!project.startDate || !project.endDate) return 0;
    const start = new Date(project.startDate).getTime();
    const end = new Date(project.endDate).getTime();
    const today = new Date().getTime();
    
    if (today < start) return 0;
    if (today > end) return 100;
    
    return Math.round(((today - start) / (end - start)) * 100);
  };

  const daysRemaining = calculateDaysRemaining();
  const timelineProgress = calculateProgress();

  return (
    <div className="space-y-6">
      {/* Project Information Card */}
      <div className="bg-white rounded-card shadow-soft border-0 p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Project Information</h3>
        
        {/* Description */}
        {project.description && (
          <div className="mb-6">
            <p className="text-text-secondary">{project.description}</p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client */}
          {project.clientName && (
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-2 rounded-card">
                <User className="w-5 h-5 text-text-primary" />
              </div>
              <div>
                <div className="text-sm text-text-secondary">Client</div>
                <div className="text-text-primary font-medium">{project.clientName}</div>
              </div>
            </div>
          )}

          {/* Project Code */}
          <div className="flex items-start gap-3">
            <div className="bg-purple-50 p-2 rounded-card">
              <Flag className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Project Code</div>
              <div className="text-text-primary font-medium font-mono">{project.projectCode}</div>
            </div>
          </div>

          {/* Project Lead */}
          <div className="flex items-start gap-3">
            <div className="bg-green-50 p-2 rounded-card">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Project Lead</div>
              <div className="text-text-primary font-medium">
                {project.projectLead
                  ? `${project.projectLead.firstName} ${project.projectLead.lastName}`
                  : 'Not assigned'}
              </div>
            </div>
          </div>

          {/* Region */}
          <div className="flex items-start gap-3">
            <div className="bg-orange-50 p-2 rounded-card">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Region</div>
              <div className="text-text-primary font-medium">{project.region}</div>
            </div>
          </div>

          {/* Priority */}
          <div className="flex items-start gap-3">
            <div className="bg-red-50 p-2 rounded-card">
              <Flag className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Priority</div>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[project.priority]}`}>
                {project.priority}
              </span>
            </div>
          </div>

          {/* Budget */}
          {project.budget && (
            <div className="flex items-start gap-3">
              <div className="bg-yellow-50 p-2 rounded-card">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-text-secondary">Budget</div>
                <div className="text-text-primary font-medium">
                  £{project.budget.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Estimated Hours */}
          {project.estimatedHours && (
            <div className="flex items-start gap-3">
              <div className="bg-indigo-50 p-2 rounded-card">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-sm text-text-secondary">Estimated Hours</div>
                <div className="text-text-primary font-medium">
                  {project.estimatedHours}h
                </div>
              </div>
            </div>
          )}

          {/* Start Date */}
          <div className="flex items-start gap-3">
            <div className="bg-teal-50 p-2 rounded-card">
              <Calendar className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Start Date</div>
              <div className="text-text-primary font-medium">{formatDate(project.startDate)}</div>
            </div>
          </div>

          {/* End Date */}
          <div className="flex items-start gap-3">
            <div className="bg-pink-50 p-2 rounded-card">
              <Calendar className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">End Date</div>
              <div className="text-text-primary font-medium">{formatDate(project.endDate)}</div>
              {daysRemaining !== null && (
                <div className={`text-xs mt-1 ${daysRemaining < 0 ? 'text-red-600' : 'text-text-muted'}`}>
                  {daysRemaining < 0
                    ? `${Math.abs(daysRemaining)} days overdue`
                    : `${daysRemaining} days remaining`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Progress */}
      {project.startDate && project.endDate && (
        <div className="bg-white rounded-card shadow-soft border-0 p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Project Timeline</h3>
          
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-secondary">Progress</span>
              <span className="text-text-primary font-medium">{timelineProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  timelineProgress > 100 ? 'bg-red-600' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(timelineProgress, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="flex justify-between text-sm text-text-secondary">
            <span>{formatDate(project.startDate)}</span>
            <span>{formatDate(project.endDate)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectOverview;






