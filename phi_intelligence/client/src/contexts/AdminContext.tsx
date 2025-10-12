import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminContextType {
  user: AdminUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing user data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('admin_user');
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Try to refresh access token using cookie
        refreshAccessToken();
      } catch (error) {
        console.error('Error parsing stored admin data:', error);
        localStorage.removeItem('admin_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // Important: Include cookies
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      
      if (data.success && data.user && data.accessToken) {
        setUser(data.user);
        setAccessToken(data.accessToken);
        
        // Store only user data in localStorage (refresh token is in cookie)
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        
        return true;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call server logout to clear cookie
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear client state
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('admin_user');
    }
  };

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include cookies
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.accessToken);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return false;
    }
  }, []);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (accessToken) {
      const interval = setInterval(() => {
        refreshAccessToken();
      }, 14 * 60 * 1000); // Refresh every 14 minutes (before 15-minute expiration)
      
      return () => clearInterval(interval);
    }
  }, [accessToken]);

  const value: AdminContextType = {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    login,
    logout,
    refreshAccessToken,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
