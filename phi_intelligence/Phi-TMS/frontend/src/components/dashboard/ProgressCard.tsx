import { LucideIcon } from 'lucide-react';
import PillBadge from '@/components/common/PillBadge';

interface ProgressSection {
  label: string;
  value: number;
  color?: string;
}

interface ProgressCardProps {
  title: string;
  icon?: LucideIcon;
  total: number;
  sections: ProgressSection[];
  showAccentForSection?: number;
}

const ProgressCard = ({
  title,
  icon: Icon,
  total,
  sections,
  showAccentForSection,
}: ProgressCardProps) => {
  const totalPercentage = total > 0 ? (sections.reduce((sum, s) => sum + s.value, 0) / total) * 100 : 0;

  return (
    <div className="card h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-text-secondary" />}
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        </div>
        <PillBadge variant="muted">{totalPercentage.toFixed(0)}%</PillBadge>
      </div>

      {/* Progress bar */}
      <div className="progress-bar mb-4">
        <div
          className="progress-fill"
          style={{ width: `${totalPercentage}%` }}
        ></div>
      </div>

      {/* Sections */}
      <div className="space-y-2">
        {sections.map((section, index) => {
          const percentage = total > 0 ? (section.value / total) * 100 : 0;
          const isAccent = index === showAccentForSection;
          
          return (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isAccent ? 'bg-accent' : section.color || 'bg-blue-400'
                  }`}
                />
                <span className="text-text-secondary">{section.label}</span>
              </div>
              <span className="font-medium text-text-primary">{section.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressCard;

