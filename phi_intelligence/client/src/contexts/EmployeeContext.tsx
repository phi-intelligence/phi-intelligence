import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';

interface EmployeeProfile {
  id: string;
  firstName: string;
  lastName: string;
  designation?: string;
  location?: string;
  joinDate?: string;
}

interface EmployeeUser {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  profile?: EmployeeProfile;
}

interface EmployeeContextType {
  user: EmployeeUser | null;
  loading: boolean;
  login: (token: string, user: EmployeeUser) => void;
  logout: () => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function getEmployeeToken(): string | null {
  return sessionStorage.getItem('employeeToken');
}

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<EmployeeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    let cancelled = false;
    const token = sessionStorage.getItem('employeeToken');
    const userData = sessionStorage.getItem('employeeUser');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        sessionStorage.removeItem('employeeToken');
        sessionStorage.removeItem('employeeUser');
      }
    }

    async function refreshProfile() {
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const meResponse = await fetch('/api/tms/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const meData = await meResponse.json();
        if (cancelled) return;
        if (meResponse.ok && meData.data) {
          sessionStorage.setItem('employeeUser', JSON.stringify(meData.data));
          setUser(meData.data);
        } else if (meResponse.status === 401) {
          sessionStorage.removeItem('employeeToken');
          sessionStorage.removeItem('employeeUser');
          setUser(null);
        }
      } catch {
        /* keep cached user */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (token) refreshProfile();
    else setLoading(false);

    return () => {
      cancelled = true;
    };
  }, []);

  const login = (token: string, user: EmployeeUser) => {
    sessionStorage.setItem('employeeToken', token);
    sessionStorage.setItem('employeeUser', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    sessionStorage.removeItem('employeeToken');
    sessionStorage.removeItem('employeeUser');
    setUser(null);
    setLocation('/employee/login');
  };

  return (
    <EmployeeContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployee() {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployee must be used within an EmployeeProvider');
  }
  return context;
}
