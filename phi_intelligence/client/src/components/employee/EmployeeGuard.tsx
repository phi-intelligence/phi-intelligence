import { useEmployee } from '@/contexts/EmployeeContext';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface EmployeeGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function EmployeeGuard({ children, allowedRoles }: EmployeeGuardProps) {
  const { user, loading } = useEmployee();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        setLocation('/employee/login');
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        setLocation('/employee'); // redirect to employee dashboard if not allowed
      }
    }
  }, [user, loading, setLocation, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F4F1]">
        <Loader2 className="w-7 h-7 animate-spin text-[#00A3FF]" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
