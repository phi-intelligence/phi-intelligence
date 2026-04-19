import { LucideIcon } from 'lucide-react';
import { User } from 'lucide-react';
import PillBadge from '@/components/common/PillBadge';

interface ProfileCardProps {
  firstName?: string;
  lastName?: string;
  role?: string;
  location?: string;
  avatarUrl?: string;
  stats?: Array<{ label: string; value: string | number; icon?: LucideIcon }>;
}

const ProfileCard = ({
  firstName,
  lastName,
  role,
  location,
  avatarUrl,
  stats = [],
}: ProfileCardProps) => {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        {/* Avatar */}
        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-text-primary font-bold text-xl shadow-soft">
          {avatarUrl ? (
            <img src={avatarUrl} alt={`${firstName} ${lastName}`} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-8 h-8" />
          )}
        </div>
        
        {/* User info */}
        <div>
          <h3 className="text-lg font-bold text-text-primary">
            {firstName} {lastName}
          </h3>
          <p className="text-sm text-text-secondary">{role}</p>
          {location && <p className="text-xs text-text-muted">{location}</p>}
        </div>
      </div>

      {/* Stats */}
      {stats.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto">
          {stats.map((stat, index) => (
            <PillBadge key={index} variant="default" icon={stat.icon}>
              <span className="font-medium">{stat.value}</span>
              <span className="text-xs">{stat.label}</span>
            </PillBadge>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileCard;

