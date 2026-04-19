import { useEffect, useState } from 'react';
import { tmsApi } from '@/services/tmsApi';
import { Loader2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function AdminAttendanceReport() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<{ attendance?: any[]; summary?: Record<string, number> } | null>(
    null
  );

  const load = async () => {
    try {
      setLoading(true);
      const res = await tmsApi.get<{ data: { attendance?: any[]; summary?: Record<string, number> } }>(
        '/attendance/report'
      );
      setReport(res.data || null);
    } catch {
      toast({
        title: 'Error',
        description: 'Could not load attendance report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-7 h-7 animate-spin text-[#00A3FF]" />
      </div>
    );
  }

  const rows = report?.attendance || [];
  const summary = report?.summary || {};

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-rajdhani tracking-wider text-stone-900 uppercase">
            Attendance Report
          </h1>
          <p className="text-stone-500 mt-1 text-sm">Filtered roster from Phi-TMS</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100 text-sm font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          ['Records', summary.total_records ?? 0],
          ['Present', summary.present_count ?? 0],
          ['Absent', summary.absent_count ?? 0],
          ['Late', summary.late_count ?? 0],
          ['Total hrs', (summary.total_hours as number)?.toFixed?.(1) ?? summary.total_hours ?? 0],
        ].map(([k, v]) => (
          <div key={String(k)} className="bg-white border border-stone-200 shadow-sm rounded-xl p-4">
            <p className="text-xs text-stone-400 uppercase tracking-widest font-semibold">{k}</p>
            <p className="text-xl font-bold text-stone-900 font-rajdhani mt-1">{v as any}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-stone-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="px-4 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase">Employee</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase">Date</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-stone-400">
                    No attendance rows (set date filters in TMS or add data)
                  </td>
                </tr>
              ) : (
                rows.map((r: any) => {
                  const p = r.user?.profile;
                  const name = [p?.first_name, p?.last_name].filter(Boolean).join(' ') || r.user?.email;
                  return (
                    <tr key={r.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3 text-stone-900 font-medium">{name}</td>
                      <td className="px-4 py-3 text-stone-600">
                        {r.date ? format(new Date(r.date), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3 text-stone-600">{r.status}</td>
                      <td className="px-4 py-3 text-stone-600">{r.total_hours ?? '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
