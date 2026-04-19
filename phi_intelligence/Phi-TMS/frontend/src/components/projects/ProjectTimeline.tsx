import { useState, useEffect } from 'react';
import { projectApi } from '../../services/projectApi';
import type { ProjectTimeline as ProjectTimelineType } from '../../types/project';
import LoadingSpinner from '../LoadingSpinner';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ProjectTimelineProps {
  projectId: string;
}

const ProjectTimeline = ({ projectId }: ProjectTimelineProps) => {
  const [timeline, setTimeline] = useState<ProjectTimelineType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [projectId]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const data = await projectApi.getProjectTimeline(projectId);
      setTimeline(data);
    } catch (err) {
      console.error('Failed to load timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (date: string): string => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'task_created':
        return <Clock className="w-4 h-4 text-text-primary" />;
      default:
        return <AlertCircle className="w-4 h-4 text-text-secondary" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!timeline) {
    return (
      <div className="bg-white rounded-card shadow-soft border-0 p-6">
        <p className="text-text-secondary">Timeline data not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Timeline Summary */}
      <div className="bg-white rounded-card shadow-soft border-0 p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Project Timeline</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-text-secondary mb-1">Days Elapsed</div>
            <div className="text-2xl font-bold text-text-primary">{timeline.daysElapsed}</div>
          </div>
          <div>
            <div className="text-sm text-text-secondary mb-1">Days Remaining</div>
            <div className={`text-2xl font-bold ${timeline.isOverdue ? 'text-red-600' : 'text-text-primary'}`}>
              {timeline.daysRemaining !== undefined ? timeline.daysRemaining : 'N/A'}
              {timeline.isOverdue && ' (Overdue)'}
            </div>
          </div>
          <div>
            <div className="text-sm text-text-secondary mb-1">Progress</div>
            <div className="text-2xl font-bold text-text-primary">{timeline.progressPercentage}%</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                timeline.isOverdue ? 'bg-red-600' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(timeline.progressPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-text-secondary mt-2">
            <span>{formatDate(timeline.startDate)}</span>
            <span>{formatDate(timeline.endDate || timeline.currentDate)}</span>
          </div>
        </div>
      </div>

      {/* Milestones */}
      {timeline.milestones && timeline.milestones.length > 0 && (
        <div className="bg-white rounded-card shadow-soft border-0 p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Milestones</h3>
          
          <div className="space-y-3">
            {timeline.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-card"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    milestone.status === 'COMPLETED'
                      ? 'bg-green-100'
                      : milestone.status === 'IN_PROGRESS'
                      ? 'bg-blue-100'
                      : 'bg-gray-100'
                  }`}
                >
                  {milestone.status === 'COMPLETED' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : milestone.status === 'IN_PROGRESS' ? (
                    <Clock className="w-5 h-5 text-text-primary" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-text-secondary" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-text-primary">{milestone.name}</h4>
                      {milestone.description && (
                        <p className="text-sm text-text-secondary mt-1">{milestone.description}</p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        milestone.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : milestone.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {milestone.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-sm text-text-muted mt-2">
                    Due: {formatDate(milestone.dueDate)}
                    {milestone.completedDate && (
                      <span> • Completed: {formatDate(milestone.completedDate)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {timeline.recentActivity && timeline.recentActivity.length > 0 && (
        <div className="bg-white rounded-card shadow-soft border-0 p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h3>
          
          <div className="space-y-4">
            {timeline.recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-primary">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-text-secondary">{activity.userName}</span>
                    <span className="text-xs text-text-muted">•</span>
                    <span className="text-xs text-text-muted">
                      {formatDateTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!timeline.recentActivity || timeline.recentActivity.length === 0) &&
        (!timeline.milestones || timeline.milestones.length === 0) && (
          <div className="bg-white rounded-card shadow-soft border-0 p-12 text-center">
            <div className="text-text-muted text-5xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-text-primary mb-2">No activity yet</h3>
            <p className="text-text-secondary">
              Activity and milestones will appear here as the project progresses
            </p>
          </div>
        )}
    </div>
  );
};

export default ProjectTimeline;






