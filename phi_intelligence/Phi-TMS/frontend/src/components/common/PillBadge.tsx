import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PillBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'muted' | 'success' | 'warning' | 'danger';
  icon?: LucideIcon;
  className?: string;
}

const PillBadge = ({ children, variant = 'default', icon: Icon, className }: PillBadgeProps) => {
  const variants = {
    default: 'bg-white text-text-primary shadow-soft',
    accent: 'bg-accent text-text-primary shadow-soft',
    muted: 'bg-gray-100 text-text-muted',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
  };

  return (
    <div className={cn('pill gap-2', variants[variant], className)}>
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </div>
  );
};

export default PillBadge;

