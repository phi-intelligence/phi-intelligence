import { useEffect, useState } from 'react';
import { tmsApi } from '@/services/tmsApi';
import { Loader2, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EmployeeAnalytics() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<any>(null);
  const [leave, setLeave] = useState<any>(null);
  const [workload, setWorkload] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [a, l, w] = await Promise.all([
          tmsApi.get<{ data: any }>('/analytics/attendance?days=30'),
          tmsApi.get<{ data: any }>('/analytics/leave'),
          tmsApi.get<{ data: any }>('/analytics/workload'),
        ]);
        setAttendance(a.data);
        setLeave(l.data);
        setWorkload(w.data);
      } catch {
        toast({
          title: 'Error',
          description: 'Could not load analytics (admin / project lead only)',
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
          <BarChart3 className="w-6 h-6 text-[#00A3FF]" />
          Analytics
        </h1>
        <p className="text-stone-500 mt-1 text-sm">Phi-TMS summaries</p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6 md:col-span-3">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Attendance (30d)</h2>
          <pre className="text-xs text-stone-600 overflow-x-auto whitespace-pre-wrap bg-stone-50 p-4 rounded-xl border border-stone-100 font-mono">
            {JSON.stringify(attendance, null, 2)}
          </pre>
        </div>
        <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6 md:col-span-3">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Leave</h2>
          <pre className="text-xs text-stone-600 overflow-x-auto whitespace-pre-wrap bg-stone-50 p-4 rounded-xl border border-stone-100 font-mono">
            {JSON.stringify(leave, null, 2)}
          </pre>
        </div>
        <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6 md:col-span-3">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Workload</h2>
          <pre className="text-xs text-stone-600 overflow-x-auto whitespace-pre-wrap bg-stone-50 p-4 rounded-xl border border-stone-100 font-mono">
            {JSON.stringify(workload, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
