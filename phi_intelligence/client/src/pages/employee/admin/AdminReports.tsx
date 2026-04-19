import { useEffect, useMemo, useState } from 'react';
import { tmsApi } from '@/services/tmsApi';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Loader2, FileText, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';

type ReportRow = {
  id: string;
  user_id: string;
  date: string;
  status: string;
  user?: {
    id: string;
    email?: string;
    username?: string;
    profile?: { first_name?: string | null; last_name?: string | null } | null;
  } | null;
};

type ReportDetail = ReportRow & { raw_content?: string };

function fullName(u?: ReportRow['user']) {
  if (!u) return '';
  return [u.profile?.first_name, u.profile?.last_name].filter(Boolean).join(' ') || u.username || u.email || 'User';
}

export default function AdminReports() {
  const { toast } = useToast();
  const [month, setMonth] = useState(new Date());
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ReportDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filterUser, setFilterUser] = useState('');

  useEffect(() => {
    load();
  }, [month]);

  async function load() {
    try {
      setLoading(true);
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      const res = await tmsApi.get<{ data: ReportRow[] }>(
        `/reports?start_date=${encodeURIComponent(start.toISOString().slice(0, 10))}&end_date=${encodeURIComponent(end.toISOString().slice(0, 10))}`,
      );
      setRows(res.data || []);
    } catch (err: any) {
      toast({ title: 'Failed to load reports', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(row: ReportRow) {
    setDetail({ ...row });
    setDetailLoading(true);
    try {
      const res = await tmsApi.get<{ data: ReportDetail }>(`/reports/${row.id}`);
      setDetail(res.data || null);
    } catch (err: any) {
      toast({ title: 'Failed to load report', description: err.message, variant: 'destructive' });
    } finally {
      setDetailLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = filterUser.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => fullName(r.user).toLowerCase().includes(q) || r.user?.email?.toLowerCase().includes(q));
  }, [rows, filterUser]);

  const grouped = useMemo(() => {
    const out: Record<string, ReportRow[]> = {};
    for (const r of filtered) {
      const key = r.date;
      if (!out[key]) out[key] = [];
      out[key].push(r);
    }
    return Object.entries(out).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-rajdhani tracking-wider text-stone-900 uppercase flex items-center gap-3">
          <FileText className="w-6 h-6 text-[#00A3FF]" />
          Daily Reports
        </h1>
        <p className="text-stone-500 mt-1 text-sm">
          Review what your team submitted, day by day.
        </p>
      </div>

      <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            className="p-2 hover:bg-stone-50 rounded-lg text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-sm font-bold font-rajdhani tracking-wider text-stone-900 min-w-[130px] text-center uppercase">
            {format(month, 'MMMM yyyy')}
          </div>
          <button
            onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            className="p-2 hover:bg-stone-50 rounded-lg text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMonth(new Date())}
            className="px-3 py-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 hover:bg-stone-50 rounded-lg uppercase tracking-wider transition-colors"
          >
            Today
          </button>
        </div>
        <input
          placeholder="Filter by name or email"
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-stone-900 placeholder-stone-400 text-sm w-full md:w-72 focus:outline-none focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF]/20"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-[#00A3FF]" />
        </div>
      ) : grouped.length === 0 ? (
        <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-16 text-center text-stone-400">
          No reports submitted in {format(month, 'MMMM yyyy')}.
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([date, items]) => (
            <div key={date} className="bg-white border border-stone-200 shadow-sm rounded-2xl overflow-hidden">
              <div className="px-6 py-3 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
                <span className="text-sm font-semibold text-stone-900">
                  {format(new Date(date), 'EEEE, MMM d, yyyy')}
                </span>
                <span className="text-xs uppercase tracking-widest text-stone-400">{items.length} reports</span>
              </div>
              <ul className="divide-y divide-stone-100">
                {items.map((row) => (
                  <li key={row.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-stone-900 text-sm font-medium">{fullName(row.user)}</p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {row.user?.email || row.user_id} · {row.status}
                      </p>
                    </div>
                    <button
                      onClick={() => openDetail(row)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 hover:border-stone-300 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-white border border-stone-200 shadow-2xl rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-stone-400">Daily report</p>
                <h3 className="text-lg font-bold text-stone-900 mt-1">{fullName(detail.user)}</h3>
                <p className="text-xs text-stone-500">{format(new Date(detail.date), 'EEEE, MMMM d, yyyy')}</p>
              </div>
              <button onClick={() => setDetail(null)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            {detailLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#00A3FF]" />
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-sm text-stone-700 bg-stone-50 p-4 rounded-xl border border-stone-200 font-mono">
                {detail.raw_content || '(empty)'}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
