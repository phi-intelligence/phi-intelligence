import { useState, useEffect } from 'react';
import { projectApi } from '../../services/projectApi';
import type { ProjectMetrics as ProjectMetricsType } from '../../types/project';
import LoadingSpinner from '../LoadingSpinner';
import { Users, CheckCircle, Clock, DollarSign } from 'lucide-react';

interface ProjectMetricsProps {
  projectId: string;
  refreshKey?: number;
}

const ProjectMetrics = ({ projectId, refreshKey = 0 }: ProjectMetricsProps) => {
  const [metrics, setMetrics] = useState<ProjectMetricsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [projectId, refreshKey]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await projectApi.getProjectMetrics(projectId);
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-card shadow-soft border-0">
            <LoadingSpinner size="sm" />
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const cards = [
    {
      icon: CheckCircle,
      label: 'Tasks',
      value: `${metrics.completedTasks}/${metrics.totalTasks}`,
      subtext: `${metrics.completionPercentage}% complete`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Users,
      label: 'Team Size',
      value: metrics.teamSize,
      subtext: 'Active members',
      color: 'text-text-primary',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Clock,
      label: 'Hours',
      value: `${metrics.totalHours}h`,
      subtext: `of ${metrics.estimatedHours || 0}h estimated`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: DollarSign,
      label: 'Budget',
      value: metrics.budgetUsed ? `£${metrics.budgetUsed.toLocaleString()}` : 'N/A',
      subtext: metrics.budgetRemaining
        ? `£${metrics.budgetRemaining.toLocaleString()} remaining`
        : 'No budget set',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-white p-6 rounded-card shadow-soft border-0">
          <div className="flex items-center justify-between mb-3">
            <div className={`${card.bgColor} p-3 rounded-lg`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
          <div className="text-sm text-text-secondary mb-1">{card.label}</div>
          <div className="text-2xl font-bold text-text-primary mb-1">{card.value}</div>
          <div className="text-xs text-text-muted">{card.subtext}</div>

          {/* Progress bar for tasks */}
          {index === 0 && (
            <div className="mt-3">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${metrics.completionPercentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Progress bar for hours */}
          {index === 2 && metrics.estimatedHours && metrics.estimatedHours > 0 && (
            <div className="mt-3">
              <div className="progress-bar">
                <div
                  className={`h-2 rounded-full transition-all ${
                    metrics.totalHours > metrics.estimatedHours ? 'bg-red-600' : 'bg-purple-600'
                  }`}
                  style={{
                    width: `${Math.min((metrics.totalHours / metrics.estimatedHours) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProjectMetrics;






