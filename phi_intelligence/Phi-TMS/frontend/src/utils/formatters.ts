import { format, parseISO, formatDistanceToNow } from 'date-fns';

export const formatDate = (date: string | Date, formatStr = 'dd/MM/yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

export const formatTime = (date: string | Date): string => {
  return formatDate(date, 'HH:mm');
};

export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatHours = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  
  if (m === 0) {
    return `${h}h`;
  }
  
  return `${h}h ${m}m`;
};

export const getStatusColor = (status: string): string => {
  const statusColors: { [key: string]: string } = {
    PRESENT: 'success',
    APPROVED: 'success',
    ACTIVE: 'success',
    COMPLETED: 'success',
    PENDING: 'warning',
    IN_PROGRESS: 'info',
    ABSENT: 'danger',
    REJECTED: 'danger',
    CANCELLED: 'gray',
    LATE: 'warning',
  };

  return statusColors[status] || 'gray';
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};






