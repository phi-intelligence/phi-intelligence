import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  // Handle undefined or null status
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border bg-gray-500/20 text-gray-300 border-gray-500/30">
        <span className="text-xs">○</span>
        Unknown
      </span>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'published':
        return {
          bg: 'bg-green-500/20',
          text: 'text-green-300',
          border: 'border-green-500/30',
          icon: '●'
        };
      case 'inactive':
      case 'draft':
        return {
          bg: 'bg-gray-500/20',
          text: 'text-gray-300',
          border: 'border-gray-500/30',
          icon: '○'
        };
      case 'pending':
        return {
          bg: 'bg-yellow-500/20',
          text: 'text-yellow-300',
          border: 'border-yellow-500/30',
          icon: '⏳'
        };
      case 'archived':
        return {
          bg: 'bg-red-500/20',
          text: 'text-red-300',
          border: 'border-red-500/30',
          icon: '🗄️'
        };
      default:
        return {
          bg: 'bg-blue-500/20',
          text: 'text-blue-300',
          border: 'border-blue-500/30',
          icon: '●'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className="text-xs">{config.icon}</span>
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </span>
  );
}
