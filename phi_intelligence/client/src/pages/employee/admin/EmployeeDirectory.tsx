import { useEffect, useState } from 'react';
import { tmsApi } from '@/services/tmsApi';
import { Loader2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EmployeeDirectory() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await tmsApi.get<{ data: { employees?: any[] } }>('/employees');
        setRows(Array.isArray(res.data?.employees) ? res.data!.employees! : []);
      } catch {
        toast({
          title: 'Error',
          description: 'Admin only — could not load employees',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-7 h-7 animate-spin text-[#00A3FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-rajdhani tracking-wider text-stone-900 uppercase flex items-center gap-3">
          <Users className="w-6 h-6 text-[#00A3FF]" />
          Employees
        </h1>
        <p className="text-stone-500 mt-1 text-sm">Directory from Phi-TMS</p>
      </div>

      <div className="bg-white border border-stone-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="px-4 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase">Name</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase">Email</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase">Role</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase">Dept</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.map((e: any) => {
                const p = e.profile || e.employee_profile;
                const name = [p?.first_name, p?.last_name].filter(Boolean).join(' ') || e.username;
                return (
                  <tr key={e.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 text-stone-900 font-medium">{name}</td>
                    <td className="px-4 py-3 text-stone-500">{e.email}</td>
                    <td className="px-4 py-3 text-stone-600">{e.role}</td>
                    <td className="px-4 py-3 text-stone-500">{p?.department || '—'}</td>
                    <td className="px-4 py-3 text-stone-500">{p?.location || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
