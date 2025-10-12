import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAdmin } from '@/contexts/AdminContext';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAdmin();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/admin/login');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Show loading state during authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Verifying Access</h2>
          <p className="text-gray-400">Please wait while we verify your authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">You are not authorized to access this area.</p>
          <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
}
