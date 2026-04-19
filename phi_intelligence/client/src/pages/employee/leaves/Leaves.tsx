import { useState, useEffect } from 'react';
import { tmsApi } from '@/services/tmsApi';
import { useEmployee } from '@/contexts/EmployeeContext';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  addDays,
  parseISO,
  isWeekend,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  AlertCircle,
  Plus,
  Loader2,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type TabType = 'request' | 'balance' | 'calendar';

export default function Leaves() {
  const { toast } = useToast();
  const { user } = useEmployee();
  const [activeTab, setActiveTab] = useState<TabType>('request');
  const [loading, setLoading] = useState(true);

  // Request tab state
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [requestForm, setRequestForm] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // Balance tab state
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Calendar tab state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'balance') {
      fetchLeaveBalances();
    } else if (activeTab === 'calendar') {
      fetchCalendarData();
    }
  }, [activeTab, selectedYear, currentMonth, user?.id]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchLeaveTypes(),
        fetchLeaveBalances(),
        fetchMyRequests(),
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const response = await tmsApi.get<{ data: any[] }>('/leave/types');
      const raw = response.data || [];
      setLeaveTypes(
        raw.map((lt: any) => ({
          id: lt.id,
          name: lt.name,
          region: lt.region,
        }))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLeaveBalances = async () => {
    try {
      const response = await tmsApi.get<{ data: any[] }>(`/leave/balance?year=${selectedYear}`);
      const raw = response.data || [];
      setLeaveBalances(
        raw.map((b: any) => ({
          id: b.id,
          leaveTypeId: b.leave_type_id,
          totalAllowance: b.total_days,
          usedBalance: b.used_days,
          remainingBalance: b.remaining_days,
          pendingBalance: 0,
        }))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const response = await tmsApi.get<{ data: any[] }>('/leave/my-requests');
      const raw = response.data || [];
      setMyRequests(
        raw.map((r: any) => ({
          ...r,
          startDate: r.start_date,
          endDate: r.end_date,
          totalDays: r.total_days,
          leaveType: r.leave_type,
        }))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCalendarData = async () => {
    try {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      const uid = user?.id;

      const [calendarResponse, holidaysResponse] = await Promise.all([
        tmsApi.get<{ data: any[] }>(
          `/leave/calendar?start_date=${encodeURIComponent(start.toISOString())}&end_date=${encodeURIComponent(end.toISOString())}`
        ),
        tmsApi.get<{ data: any[] }>(`/leave/holidays?year=${currentMonth.getFullYear()}&region=UK`),
      ]);

      const rawLeaves = calendarResponse.data || [];
      setCalendarData(
        rawLeaves.map((l: any) => {
          const prof = l.user?.profile;
          const nameFromProfile =
            prof && (prof.first_name || prof.last_name)
              ? [prof.first_name, prof.last_name].filter(Boolean).join(' ')
              : '';
          const employeeName = nameFromProfile || l.user?.email || 'Team member';
          return {
            ...l,
            startDate: l.start_date,
            endDate: l.end_date,
            employeeName,
            leaveType: l.leave_type || { name: 'Leave' },
            isCurrentUser: uid ? l.user_id === uid : false,
          };
        })
      );

      const rawHolidays = holidaysResponse.data || [];
      setHolidays(
        rawHolidays.map((h: any) => ({
          ...h,
          date:
            typeof h.date === 'string'
              ? h.date.slice(0, 10)
              : format(new Date(h.date), 'yyyy-MM-dd'),
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const calculateWorkingDays = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    let days = 0;

    for (let d = start; d <= end; d = addDays(d, 1)) {
      if (!isWeekend(d)) {
        days++;
      }
    }

    return days;
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.leaveTypeId || !requestForm.startDate || !requestForm.endDate) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const days = calculateWorkingDays(requestForm.startDate, requestForm.endDate);
    if (days <= 0) {
      toast({ title: "Error", description: "Selected range contains no working days", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await tmsApi.post('/leave/request', {
        leave_type_id: requestForm.leaveTypeId,
        start_date: new Date(requestForm.startDate + 'T12:00:00').toISOString(),
        end_date: new Date(requestForm.endDate + 'T12:00:00').toISOString(),
        reason: requestForm.reason || undefined,
      });

      toast({ title: "Leave request submitted successfully" });
      setRequestForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
      fetchMyRequests();
      fetchLeaveBalances();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to submit request", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;

    try {
      await tmsApi.delete(`/leave/requests/${id}`);
      toast({ title: "Leave request cancelled" });
      fetchMyRequests();
      fetchLeaveBalances();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to cancel request", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A3FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-rajdhani tracking-wider text-stone-900 uppercase">Leaves</h1>
        <p className="text-stone-500 mt-1 text-sm">Manage your time off and view team availability</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-stone-200">
        {(['request', 'balance', 'calendar'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-6 py-3 text-sm font-semibold tracking-widest uppercase transition-all border-b-2 ${
              activeTab === t
                ? 'border-[#00A3FF] text-[#00A3FF]'
                : 'border-transparent text-stone-400 hover:text-stone-700 hover:bg-stone-50'
            }`}
          >
            {t === 'request' ? 'My Requests' : t === 'balance' ? 'Leave Balance' : 'Calendar'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'request' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6">
                <h3 className="text-xs font-semibold tracking-widest text-stone-400 uppercase mb-6">New Request</h3>

                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">Leave Type</label>
                    <select
                      value={requestForm.leaveTypeId}
                      onChange={(e) => setRequestForm({ ...requestForm, leaveTypeId: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF]/20 outline-none text-sm"
                      required
                    >
                      <option value="">Select type...</option>
                      {leaveTypes.map((type) => {
                        const balance = leaveBalances.find(b => b.leaveTypeId === type.id);
                        return (
                          <option key={type.id} value={type.id}>
                            {type.name} {balance ? `(${balance.remainingBalance} days left)` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={requestForm.startDate}
                        onChange={(e) => setRequestForm({ ...requestForm, startDate: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF]/20 outline-none text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">End Date</label>
                      <input
                        type="date"
                        value={requestForm.endDate}
                        min={requestForm.startDate}
                        onChange={(e) => setRequestForm({ ...requestForm, endDate: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF]/20 outline-none text-sm"
                        required
                      />
                    </div>
                  </div>

                  {requestForm.startDate && requestForm.endDate && (
                    <div className="bg-[#EBF5FF] border border-[#00A3FF]/20 rounded-xl p-4 flex items-center gap-3 text-[#00A3FF] text-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p>This request spans <strong>{calculateWorkingDays(requestForm.startDate, requestForm.endDate)}</strong> working days.</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">Reason</label>
                    <textarea
                      value={requestForm.reason}
                      onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF]/20 outline-none h-24 resize-none text-sm"
                      placeholder="Optional reason for leave..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#00A3FF] hover:bg-[#0090e0] text-white font-semibold tracking-wider uppercase py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Submit Request</>}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6">
                <h3 className="text-xs font-semibold tracking-widest text-stone-400 uppercase mb-6">Recent Requests</h3>

                {myRequests.length === 0 ? (
                  <div className="text-center py-12 text-stone-400">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>You haven't made any leave requests yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myRequests.map((req) => (
                      <div key={req.id} className="bg-stone-50 border border-stone-200 rounded-xl p-5 flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-stone-900">{req.leaveType?.name}</span>
                            <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border ${
                              req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              req.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-200' :
                              req.status === 'CANCELLED' ? 'bg-stone-100 text-stone-500 border-stone-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                          <p className="text-sm text-stone-600">
                            {format(new Date(req.startDate), 'MMM d, yyyy')} - {format(new Date(req.endDate), 'MMM d, yyyy')}
                            <span className="mx-2 text-stone-300">•</span>
                            {req.totalDays} days
                          </p>
                          {req.reason && <p className="text-sm text-stone-400 mt-2 italic">"{req.reason}"</p>}
                        </div>

                        {req.status === 'PENDING' && (
                          <div className="flex items-center">
                            <button
                              onClick={() => handleCancelRequest(req.id)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancel Request"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'balance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaveBalances.map((balance) => {
              const type = leaveTypes.find(t => t.id === balance.leaveTypeId);
              const percentage = Math.min((balance.usedBalance / balance.totalAllowance) * 100, 100);

              return (
                <div key={balance.id} className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-bold text-stone-900 text-lg">{type?.name || 'Leave'}</h4>
                      <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">Allowance: {balance.totalAllowance}d</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#EBF5FF] flex items-center justify-center text-[#00A3FF] font-bold text-xl font-rajdhani">
                      {balance.remainingBalance}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-stone-500 font-medium">
                      <span>Used: {balance.usedBalance}d</span>
                      <span>Pending: {balance.pendingBalance}d</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00A3FF] rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-stone-50 rounded-xl transition text-stone-400 hover:text-stone-700 border border-stone-200">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-lg font-bold font-rajdhani tracking-wider text-stone-900 min-w-[150px] text-center uppercase">
                  {format(currentMonth, 'MMMM yyyy')}
                </div>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-stone-50 rounded-xl transition text-stone-400 hover:text-stone-700 border border-stone-200">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-4 text-xs font-semibold tracking-widest uppercase text-stone-500">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#00A3FF]" /> My Leave</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-violet-500" /> Team Leave</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Holiday</div>
              </div>
            </div>

            <div className="grid grid-cols-7 bg-stone-50 border-b border-stone-200">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="p-4 text-center text-xs font-semibold tracking-widest text-stone-400 uppercase">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {(() => {
                const monthStart = startOfMonth(currentMonth);
                const monthEnd = endOfMonth(currentMonth);
                const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
                const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
                const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

                const weeks = [];
                for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

                return weeks.map((week, weekIdx) =>
                  week.map((day, dayIdx) => {
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isCurrentDay = isToday(day);

                    const dayString = format(day, 'yyyy-MM-dd');
                    const dayHolidays = holidays.filter(h => h.date === dayString);
                    const dayLeaves = calendarData.filter(l =>
                      dayString >= format(new Date(l.startDate), 'yyyy-MM-dd') &&
                      dayString <= format(new Date(l.endDate), 'yyyy-MM-dd')
                    );

                    return (
                      <div
                        key={`${weekIdx}-${dayIdx}`}
                        className={`min-h-[120px] p-2 border-b border-r border-stone-100 ${
                          !isCurrentMonth ? 'bg-stone-50/60 opacity-50' : 'hover:bg-stone-50/60'
                        } ${isCurrentDay ? 'ring-1 ring-inset ring-[#00A3FF]' : ''}`}
                      >
                        <span className={`text-sm font-bold font-rajdhani ${isCurrentMonth ? 'text-stone-900' : 'text-stone-400'}`}>
                          {format(day, 'd')}
                        </span>

                        <div className="mt-2 space-y-1">
                          {dayHolidays.map(h => (
                            <div key={h.id} className="text-[10px] px-1.5 py-1 rounded bg-emerald-50 text-emerald-700 font-medium truncate border border-emerald-100" title={h.name}>
                              🌴 {h.name}
                            </div>
                          ))}
                          {dayLeaves.map(l => (
                            <div key={l.id} className={`text-[10px] px-1.5 py-1 rounded font-medium truncate ${
                              l.isCurrentUser ? 'bg-[#EBF5FF] text-[#00A3FF]' : 'bg-violet-50 text-violet-600 border border-violet-100'
                            }`} title={`${l.employeeName} - ${l.leaveType.name}`}>
                              {l.isCurrentUser ? 'Me: ' : ''}{l.employeeName}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
