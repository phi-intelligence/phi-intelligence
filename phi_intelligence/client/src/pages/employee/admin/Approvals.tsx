import { useState, useEffect, useCallback } from 'react';
import { tmsApi } from '@/services/tmsApi';
import { Check, X, Clock, Loader2, Calendar, type LucideIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type TmsSuccess<T> = { success?: boolean; message?: string; data: T };

type PendingTimelogsPayload = {
  pending_count?: number;
  time_logs?: any[];
};

type ApprovalsProps = { defaultTab?: 'time' | 'leave' };

export default function Approvals({ defaultTab = 'time' }: ApprovalsProps) {
  const { toast } = useToast();
  const [tab, setTab] = useState<'time' | 'leave'>(defaultTab);
  const [loading, setLoading] = useState(true);
  const [leaveLoading, setLeaveLoading] = useState(true);
  const [pendingLogs, setPendingLogs] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);

  const fetchPendingTimelogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await tmsApi.get<TmsSuccess<PendingTimelogsPayload>>(
        '/timelogs/pending-approvals'
      );
      const payload = response.data;
      const logs = Array.isArray(payload?.time_logs) ? payload.time_logs : [];
      setPendingLogs(logs);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load pending time entries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchLeaveRequests = useCallback(async () => {
    try {
      setLeaveLoading(true);
      const response = await tmsApi.get<TmsSuccess<any[]>>('/leave/requests');
      const list = Array.isArray(response.data) ? response.data : [];
      setLeaveRequests(list);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load leave requests',
        variant: 'destructive',
      });
    } finally {
      setLeaveLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const q = sp.get('tab');
    if (q === 'leave' || q === 'time') {
      setTab(q);
    }
  }, []);

  useEffect(() => {
    fetchPendingTimelogs();
  }, [fetchPendingTimelogs]);

  useEffect(() => {
    if (tab === 'leave') {
      fetchLeaveRequests();
    }
  }, [tab, fetchLeaveRequests]);

  const handleApproveLog = async (id: string) => {
    try {
      await tmsApi.put(`/timelogs/${id}/approve`);
      toast({ title: 'Timesheet approved' });
      setPendingLogs((logs) => logs.filter((l) => l.id !== id));
    } catch {
      toast({ title: 'Error', description: 'Failed to approve', variant: 'destructive' });
    }
  };

  const handleRejectLog = async (id: string) => {
    try {
      await tmsApi.put(`/timelogs/${id}/reject`, {
        reason: 'Rejected by manager — please review and resubmit.',
      });
      toast({ title: 'Timesheet rejected' });
      setPendingLogs((logs) => logs.filter((l) => l.id !== id));
    } catch {
      toast({ title: 'Error', description: 'Failed to reject', variant: 'destructive' });
    }
  };

  const handleApproveLeave = async (id: string) => {
    try {
      await tmsApi.put(`/leave/requests/${id}/approve`);
      toast({ title: 'Leave approved' });
      setLeaveRequests((rows) => rows.filter((r) => r.id !== id));
    } catch {
      toast({ title: 'Error', description: 'Failed to approve leave', variant: 'destructive' });
    }
  };

  const handleRejectLeave = async (id: string) => {
    try {
      await tmsApi.put(`/leave/requests/${id}/reject`, {
        reason: 'Rejected — please contact your manager.',
      });
      toast({ title: 'Leave rejected' });
      setLeaveRequests((rows) => rows.filter((r) => r.id !== id));
    } catch {
      toast({ title: 'Error', description: 'Failed to reject leave', variant: 'destructive' });
    }
  };

  const tabBtn = (key: 'time' | 'leave', label: string, Icon: LucideIcon) => (
    <button
      type="button"
      key={key}
      onClick={() => setTab(key)}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
        tab === key
          ? 'bg-[#EBF5FF] text-[#00A3FF] border border-[#00A3FF]/20'
          : 'text-stone-500 border border-stone-200 hover:text-stone-900 hover:bg-stone-50'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-rajdhani tracking-wider text-stone-900 uppercase">
          Approvals
        </h1>
        <p className="text-stone-500 mt-1 text-sm">
          Approve time logs for your projects and team leave requests
        </p>
        <div className="flex flex-wrap gap-2 mt-6">
          {tabBtn('time', 'Time logs', Clock)}
          {tabBtn('leave', 'Leave requests', Calendar)}
        </div>
      </div>

      {tab === 'time' && (
        <>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-7 h-7 animate-spin text-[#00A3FF]" />
            </div>
          ) : pendingLogs.length === 0 ? (
            <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-16 text-center">
              <Check className="w-12 h-12 mx-auto mb-4 text-emerald-500 opacity-60" />
              <h3 className="text-lg font-bold text-stone-900 mb-2 font-rajdhani tracking-widest uppercase">
                All caught up
              </h3>
              <p className="text-stone-400 text-sm">
                No pending time logs for projects you lead (or none assigned yet).
              </p>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 shadow-sm rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200">
                      <th className="px-6 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase">Employee</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase">Date</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase">Project</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase text-center">Hours</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {pendingLogs.map((log) => {
                      const fn = log.user?.profile?.first_name ?? '';
                      const ln = log.user?.profile?.last_name ?? '';
                      return (
                        <tr key={log.id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#EBF5FF] flex items-center justify-center text-[#00A3FF] font-bold text-xs">
                                {fn?.[0] || log.user?.username?.[0] || 'U'}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-stone-900">
                                  {[fn, ln].filter(Boolean).join(' ') || log.user?.email || '—'}
                                </p>
                                <p className="text-xs text-stone-400">{log.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">
                            {log.date ? format(new Date(log.date), 'MMM d, yyyy') : '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">
                            {log.project?.name || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-semibold text-sm border border-amber-200">
                              <Clock className="w-3 h-3" />
                              {log.hours}h
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleApproveLog(log.id)}
                                className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectLog(log.id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'leave' && (
        <>
          {leaveLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-7 h-7 animate-spin text-[#00A3FF]" />
            </div>
          ) : leaveRequests.length === 0 ? (
            <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-16 text-center">
              <Check className="w-12 h-12 mx-auto mb-4 text-emerald-500 opacity-60" />
              <h3 className="text-lg font-bold text-stone-900 mb-2 font-rajdhani tracking-widest uppercase">
                No pending leave
              </h3>
              <p className="text-stone-400 text-sm">There are no pending leave requests.</p>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 shadow-sm rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200">
                      <th className="px-6 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase">Employee</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase">Type</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase">Dates</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase">Days</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-widest text-stone-400 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {leaveRequests.map((req) => {
                      const p = req.user?.profile;
                      const fn = p?.first_name ?? '';
                      const ln = p?.last_name ?? '';
                      return (
                        <tr key={req.id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-stone-900">
                              {[fn, ln].filter(Boolean).join(' ') || req.user?.email}
                            </p>
                            <p className="text-xs text-stone-400">{p?.department || ''}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-stone-600">
                            {req.leave_type?.name || '—'}
                          </td>
                          <td className="px-6 py-4 text-sm text-stone-600 whitespace-nowrap">
                            {req.start_date && req.end_date
                              ? `${format(new Date(req.start_date), 'MMM d')} – ${format(new Date(req.end_date), 'MMM d, yyyy')}`
                              : '—'}
                          </td>
                          <td className="px-6 py-4 text-sm text-stone-700 font-medium">{req.total_days}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleApproveLeave(req.id)}
                                className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectLeave(req.id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
