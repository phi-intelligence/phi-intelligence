import { useState } from 'react';
import { useLocation } from 'wouter';
import { useEmployee } from '@/contexts/EmployeeContext';
import { Loader2, Lock, User, AlertCircle } from 'lucide-react';

export default function EmployeeLogin() {
  const [, setLocation] = useLocation();
  const { login } = useEmployee();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/tms/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === 'string' ? data.detail : data.message || 'Login failed'
        );
      }

      const token = data.data?.token as string | undefined;
      if (!token) {
        throw new Error('Invalid login response: missing token');
      }

      const meResponse = await fetch('/api/tms/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const meData = await meResponse.json();
      if (!meResponse.ok) {
        throw new Error(meData.detail || meData.message || 'Failed to load profile');
      }

      const userPayload = meData.data;
      login(token, userPayload);
      setLocation('/employee');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-tms-portal
      className="min-h-screen bg-[hsl(var(--tms-canvas))] flex items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Subtle background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/60 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-stone-200/80 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white border border-stone-200 shadow-xl p-8 md:p-12 rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00A3FF]/40 to-transparent rounded-t-2xl" />

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 mb-6">
              <img src="/assets/logophi.png" alt="Phi Logo" className="w-7 h-7 filter brightness-0" />
            </div>
            <h1 className="text-2xl font-bold font-rajdhani tracking-widest text-stone-900 mb-1 uppercase">Employee Portal</h1>
            <p className="text-stone-500 text-sm">Sign in to your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold tracking-widest text-stone-400 uppercase mb-2">Email Address</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF]/30 transition-all text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-widest text-stone-400 uppercase mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF]/30 transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#00A3FF] text-white font-semibold hover:bg-[#0090e0] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm text-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
