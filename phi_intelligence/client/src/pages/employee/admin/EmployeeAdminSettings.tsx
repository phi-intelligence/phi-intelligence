import { useEffect, useState } from 'react';
import { tmsApi } from '@/services/tmsApi';
import { Loader2, Settings, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function EmployeeAdminSettings() {
  const { toast } = useToast();
  const [tab, setTab] = useState<'types' | 'holidays' | 'audit'>('types');
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });

  const [newType, setNewType] = useState({
    name: '',
    region: 'UK',
    days_allowed: '25',
    description: '',
  });
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    date: '',
    region: 'UK',
    description: '',
  });

  const loadTypes = async () => {
    const res = await tmsApi.get<{ data: any[] }>('/leave/types');
    setLeaveTypes(Array.isArray(res.data) ? res.data : []);
  };

  const loadHolidays = async () => {
    const res = await tmsApi.get<{ data: any[] }>('/leave/holidays');
    setHolidays(Array.isArray(res.data) ? res.data : []);
  };

  const loadAudit = async (page = 1) => {
    try {
      setAuditLoading(true);
      const res = await tmsApi.get<{
        data: { logs?: any[]; pagination?: { page: number; total_pages: number } };
      }>(`/admin/audit-logs?page=${page}&limit=25`);
      const inner = res.data;
      setAuditLogs(Array.isArray(inner?.logs) ? inner.logs : []);
      if (inner?.pagination) {
        setPagination({
          page: inner.pagination.page,
          total_pages: inner.pagination.total_pages,
        });
      }
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await Promise.all([loadTypes(), loadHolidays()]);
      } catch {
        toast({
          title: 'Error',
          description: 'Could not load settings data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  useEffect(() => {
    if (tab === 'audit') {
      loadAudit(1).catch(() =>
        toast({ title: 'Error', description: 'Could not load audit log', variant: 'destructive' })
      );
    }
  }, [tab]);

  const createLeaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tmsApi.post('/admin/leave-types', {
        name: newType.name,
        region: newType.region,
        days_allowed: parseInt(newType.days_allowed, 10),
        description: newType.description || null,
        carry_forward: false,
        is_encashable: false,
      });
      toast({ title: 'Leave type created' });
      setNewType({ name: '', region: 'UK', days_allowed: '25', description: '' });
      await loadTypes();
    } catch (err: any) {
      toast({ title: 'Failed', description: err.message, variant: 'destructive' });
    }
  };

  const createHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHoliday.date) return;
    try {
      await tmsApi.post('/admin/holidays', {
        name: newHoliday.name,
        date: new Date(newHoliday.date + 'T12:00:00').toISOString(),
        region: newHoliday.region,
        description: newHoliday.description || null,
      });
      toast({ title: 'Holiday added' });
      setNewHoliday({ name: '', date: '', region: 'UK', description: '' });
      await loadHolidays();
    } catch (err: any) {
      toast({ title: 'Failed', description: err.message, variant: 'destructive' });
    }
  };

  const deleteHoliday = async (id: string) => {
    try {
      await tmsApi.delete(`/admin/holidays/${id}`);
      toast({ title: 'Holiday removed' });
      await loadHolidays();
    } catch (err: any) {
      toast({ title: 'Failed', description: err.message, variant: 'destructive' });
    }
  };

  if (loading && tab !== 'audit') {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A3FF]" />
      </div>
    );
  }

  const input =
    'w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 text-sm focus:outline-none focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF]/20';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-rajdhani tracking-wider text-stone-900 uppercase flex items-center gap-3">
          <Settings className="w-6 h-6 text-[#00A3FF]" />
          Admin settings
        </h1>
        <p className="text-stone-500 mt-1 text-sm">Leave types, holidays, audit log</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['types', 'holidays', 'audit'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              tab === t
                ? 'bg-[#EBF5FF] text-[#00A3FF] border border-[#00A3FF]/20'
                : 'text-stone-500 border border-stone-200 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            {t === 'types' ? 'Leave types' : t === 'holidays' ? 'Holidays' : 'Audit log'}
          </button>
        ))}
      </div>

      {tab === 'types' && (
        <div className="grid md:grid-cols-2 gap-8">
          <form onSubmit={createLeaveType} className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-stone-900">New leave type</h2>
            <input
              className={input}
              placeholder="Name"
              value={newType.name}
              onChange={(e) => setNewType((s) => ({ ...s, name: e.target.value }))}
              required
            />
            <select
              className={input}
              value={newType.region}
              onChange={(e) => setNewType((s) => ({ ...s, region: e.target.value }))}
            >
              <option value="UK">UK</option>
              <option value="INDIA">India</option>
              <option value="BOTH">Both</option>
            </select>
            <input
              className={input}
              type="number"
              min={1}
              value={newType.days_allowed}
              onChange={(e) => setNewType((s) => ({ ...s, days_allowed: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Description"
              value={newType.description}
              onChange={(e) => setNewType((s) => ({ ...s, description: e.target.value }))}
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#00A3FF] text-white font-semibold text-sm shadow-sm hover:bg-[#0090e0]"
            >
              Create
            </button>
          </form>
          <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6">
            <h2 className="text-base font-bold text-stone-900 mb-4">Existing types</h2>
            <ul className="space-y-2 text-sm text-stone-600 max-h-[400px] overflow-y-auto">
              {leaveTypes.map((lt) => (
                <li key={lt.id} className="border-b border-stone-100 pb-2">
                  <span className="text-stone-900 font-medium">{lt.name}</span>{' '}
                  <span className="text-stone-400">
                    ({lt.region}) — {lt.days_allowed}d
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === 'holidays' && (
        <div className="grid md:grid-cols-2 gap-8">
          <form onSubmit={createHoliday} className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-stone-900">New public holiday</h2>
            <input
              className={input}
              placeholder="Name"
              value={newHoliday.name}
              onChange={(e) => setNewHoliday((s) => ({ ...s, name: e.target.value }))}
              required
            />
            <input
              className={input}
              type="date"
              value={newHoliday.date}
              onChange={(e) => setNewHoliday((s) => ({ ...s, date: e.target.value }))}
              required
            />
            <select
              className={input}
              value={newHoliday.region}
              onChange={(e) => setNewHoliday((s) => ({ ...s, region: e.target.value }))}
            >
              <option value="UK">UK</option>
              <option value="INDIA">India</option>
              <option value="BOTH">Both</option>
            </select>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#00A3FF] text-white font-semibold text-sm shadow-sm hover:bg-[#0090e0]"
            >
              Add
            </button>
          </form>
          <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6">
            <h2 className="text-base font-bold text-stone-900 mb-4">Holidays</h2>
            <ul className="space-y-2">
              {holidays.map((h: any) => (
                <li
                  key={h.id}
                  className="flex justify-between items-center text-sm text-stone-700 border-b border-stone-100 pb-2"
                >
                  <span>
                    {h.name} — {h.date ? format(new Date(h.date), 'MMM d, yyyy') : ''} ({h.region})
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteHoliday(h.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === 'audit' && (
        <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6">
          <h2 className="text-base font-bold text-stone-900 mb-4">Audit log</h2>
          {auditLoading ? (
            <p className="text-stone-400 text-sm">Loading…</p>
          ) : auditLogs.length === 0 ? (
            <p className="text-stone-400 text-sm">No entries</p>
          ) : (
            <ul className="space-y-2 text-sm max-h-[480px] overflow-y-auto">
              {auditLogs.map((log: any) => (
                <li key={log.id} className="border-b border-stone-100 pb-2 text-stone-600">
                  <span className="text-[#00A3FF] font-medium">{log.action}</span> {log.entity}{' '}
                  <span className="text-stone-400 text-xs">
                    {log.timestamp ? format(new Date(log.timestamp), 'MMM d HH:mm') : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => loadAudit(pagination.page - 1)}
              className="px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-600 text-sm disabled:opacity-40 hover:bg-stone-200 transition-colors"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.total_pages}
              onClick={() => loadAudit(pagination.page + 1)}
              className="px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-600 text-sm disabled:opacity-40 hover:bg-stone-200 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
