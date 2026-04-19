import { cn } from '@/utils/cn';
import { getStatusColor } from '@/utils/formatters';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const color = getStatusColor(status);

  return (
    <span
      className={cn(
        'badge',
        {
          'badge-success': color === 'success',
          'badge-warning': color === 'warning',
          'badge-danger': color === 'danger',
          'badge-info': color === 'info',
          'badge-gray': color === 'gray',
        },
        className
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
};

export default StatusBadge;






