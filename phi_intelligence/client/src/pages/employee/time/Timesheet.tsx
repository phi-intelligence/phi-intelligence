import { useState, useEffect, useCallback, useMemo } from 'react';
import { tmsApi, unwrapTmsPaginatedList } from '@/services/tmsApi';
import { useEmployee } from '@/contexts/EmployeeContext';
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Save, Plus, Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ROW_PREFIX = 'p:';

function rowKeyForProject(projectId: string) {
  return `${ROW_PREFIX}${projectId}`;
}

function newRowKey() {
  return `n:${crypto.randomUUID()}`;
}

type RowState = { rowKey: string; projectId: string };

type SheetEntry = {
  rowKey: string;
  projectId: string;
  date: string;
  hours: number;
  id?: string;
  isDirty: boolean;
};

function mapLogToEntry(row: any, rowKey: string): SheetEntry {
  const d = row.date;
  const dateStr = typeof d === 'string' ? d.slice(0, 10) : format(new Date(d), 'yyyy-MM-dd');
  return {
    rowKey,
    projectId: row.project_id,
    date: dateStr,
    hours: row.hours,
    id: row.id,
    isDirty: false,
  };
}

export default function Timesheet() {
  const { toast } = useToast();
  const { user } = useEmployee();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [rows, setRows] = useState<RowState[]>([]);
  const [entries, setEntries] = useState<SheetEntry[]>([]);

  const weekKey = useMemo(
    () => format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    [currentDate],
  );
  const weekStart = useMemo(() => new Date(`${weekKey}T00:00:00`), [weekKey]);
  const weekEnd = useMemo(() => endOfWeek(weekStart, { weekStartsOn: 1 }), [weekStart]);
  const daysInWeek = useMemo(
    () => eachDayOfInterval({ start: weekStart, end: weekEnd }),
    [weekStart, weekEnd],
  );

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const qs = `start_date=${encodeURIComponent(weekStart.toISOString())}&end_date=${encodeURIComponent(weekEnd.toISOString())}`;
      const [projectsRes, sheetRes] = await Promise.all([
        tmsApi.get<{ data?: unknown }>('/projects?status=ACTIVE&page=1&limit=50'),
        tmsApi.get<{ data?: { time_logs?: any[] } }>(`/timelogs/timesheet/${user.id}?${qs}`),
      ]);
      const projectList = unwrapTmsPaginatedList<{ id: string; name: string }>(projectsRes);
      setProjects(projectList);

      const timeLogs = sheetRes.data?.time_logs ?? [];
      const byProject = new Map<string, any[]>();
      for (const log of timeLogs) {
        const pid = log.project_id;
        if (!byProject.has(pid)) byProject.set(pid, []);
        byProject.get(pid)!.push(log);
      }

      let nextRows: RowState[] = Array.from(byProject.keys()).map((pid) => ({
        rowKey: rowKeyForProject(pid),
        projectId: pid,
      }));

      if (nextRows.length === 0 && projectList[0]) {
        nextRows = [{ rowKey: newRowKey(), projectId: projectList[0].id }];
      }

      setRows(nextRows);

      const nextEntries: SheetEntry[] = [];
      for (const log of timeLogs) {
        const rk = rowKeyForProject(log.project_id);
        nextEntries.push(mapLogToEntry(log, rk));
      }
      setEntries(nextEntries);
    } catch {
      toast({ title: 'Error', description: 'Failed to load timesheet data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [user?.id, weekKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

  const getEntry = (rowKey: string, day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return entries.find((e) => e.rowKey === rowKey && e.date === dateStr);
  };

  const handleHoursChange = (rowKey: string, projectId: string, day: Date, hoursRaw: string) => {
    const numHours = parseFloat(hoursRaw);
    const hours = Number.isFinite(numHours) ? numHours : 0;
    if (hours < 0 || hours > 24) return;

    const dateStr = format(day, 'yyyy-MM-dd');
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.rowKey === rowKey && e.date === dateStr);
      const next = [...prev];
      if (hours === 0) {
        if (idx >= 0) {
          next[idx] = { ...next[idx], hours: 0, isDirty: true };
        }
        return next;
      }
      if (idx >= 0) {
        next[idx] = { ...next[idx], projectId, hours, isDirty: true };
      } else {
        next.push({ rowKey, projectId, date: dateStr, hours, isDirty: true });
      }
      return next;
    });
  };

  const handleProjectChange = (rowKey: string, newProjectId: string) => {
    setRows((prev) => prev.map((r) => (r.rowKey === rowKey ? { ...r, projectId: newProjectId } : r)));
    setEntries((prev) =>
      prev.map((e) => (e.rowKey === rowKey ? { ...e, projectId: newProjectId, isDirty: true } : e))
    );
  };

  const handleAddRow = () => {
    if (!projects[0]) return;
    const rk = newRowKey();
    setRows((prev) => [...prev, { rowKey: rk, projectId: projects[0].id }]);
  };

  const handleSave = async () => {
    const dirty = entries.filter((e) => e.isDirty);
    if (dirty.length === 0) {
      toast({ title: 'No changes to save' });
      return;
    }

    setSaving(true);
    try {
      for (const e of dirty) {
        if (e.hours <= 0) {
          if (e.id && !e.id.startsWith('temp-')) {
            await tmsApi.delete(`/timelogs/${e.id}`);
          }
          continue;
        }

        const day = new Date(e.date + 'T12:00:00');
        if (!e.id || e.id.startsWith('temp-')) {
          await tmsApi.post('/timelogs/', {
            project_id: e.projectId,
            task_id: undefined,
            date: day.toISOString(),
            hours: e.hours,
            description: undefined,
            is_billable: true,
          });
        } else {
          await tmsApi.put(`/timelogs/${e.id}`, {
            project_id: e.projectId,
            hours: e.hours,
            date: day.toISOString(),
          });
        }
      }

      toast({ title: 'Timesheet saved successfully' });
      await fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save timesheet';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const hasDirty = entries.some((e) => e.isDirty);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A3FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-rajdhani tracking-wider text-stone-900 uppercase">Timesheet</h1>
          <p className="text-stone-500 mt-1 text-sm">Log your daily hours against assigned projects</p>
        </div>

        <div className="flex items-center gap-4 bg-white border border-stone-200 shadow-sm rounded-xl p-2">
          <button
            type="button"
            onClick={handlePrevWeek}
            className="p-2 hover:bg-stone-50 rounded-lg transition text-stone-400 hover:text-stone-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-sm font-semibold font-rajdhani tracking-widest text-stone-900 uppercase w-48 text-center">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </div>
          <button
            type="button"
            onClick={handleNextWeek}
            className="p-2 hover:bg-stone-50 rounded-lg transition text-stone-400 hover:text-stone-700"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white border border-stone-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="px-6 py-4 text-xs font-semibold tracking-widest text-stone-400 uppercase w-64">
                  Project
                </th>
                {daysInWeek.map((day) => (
                  <th
                    key={day.toISOString()}
                    className={`px-2 py-4 text-center ${isToday(day) ? 'bg-[#EBF5FF]' : ''}`}
                  >
                    <div className="text-[10px] font-semibold tracking-widest uppercase text-stone-400 mb-1">
                      {format(day, 'EEE')}
                    </div>
                    <div className={`text-sm font-bold ${isToday(day) ? 'text-[#00A3FF]' : 'text-stone-700'}`}>
                      {format(day, 'd')}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-xs font-semibold tracking-widest text-stone-400 uppercase text-center">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.map((row) => {
                const project = projects.find((p) => p.id === row.projectId);
                let rowTotal = 0;
                for (const day of daysInWeek) {
                  const e = getEntry(row.rowKey, day);
                  if (e && e.hours > 0) rowTotal += e.hours;
                }

                return (
                  <tr key={row.rowKey} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <select
                        value={row.projectId}
                        onChange={(ev) => handleProjectChange(row.rowKey, ev.target.value)}
                        className="bg-stone-50 border border-stone-200 rounded-lg text-sm font-medium text-stone-900 w-full focus:outline-none focus:ring-1 focus:ring-[#00A3FF] px-2 py-1 truncate"
                      >
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      {!project && (
                        <p className="text-[10px] text-amber-600 mt-1 uppercase tracking-wider">Unknown project</p>
                      )}
                    </td>

                    {daysInWeek.map((day) => {
                      const log = getEntry(row.rowKey, day);
                      const displayHours = log && log.hours > 0 ? log.hours : '';
                      const dirty = log?.isDirty;

                      return (
                        <td
                          key={day.toISOString()}
                          className={`px-2 py-4 text-center ${isToday(day) ? 'bg-[#EBF5FF]/40' : ''}`}
                        >
                          <input
                            type="number"
                            min="0"
                            max="24"
                            step="0.5"
                            value={displayHours === '' ? '' : displayHours}
                            onChange={(ev) => handleHoursChange(row.rowKey, row.projectId, day, ev.target.value)}
                            className={`w-14 bg-stone-50 border ${
                              dirty ? 'border-amber-400' : 'border-stone-200'
                            } rounded-lg px-2 py-2 text-stone-900 text-center focus:outline-none focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF]/20 transition-all text-sm font-rajdhani`}
                            placeholder="0"
                          />
                        </td>
                      );
                    })}

                    <td className="px-6 py-4 text-center font-bold text-[#00A3FF]">{rowTotal.toFixed(1)}h</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-stone-50 border-t border-stone-200">
              <tr>
                <td className="px-6 py-4 text-xs font-semibold tracking-widest text-stone-400 uppercase text-right">
                  Weekly Total
                </td>
                {daysInWeek.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayTotal = entries
                    .filter((e) => e.date === dateStr && e.hours > 0)
                    .reduce((sum, e) => sum + e.hours, 0);
                  return (
                    <td key={`total-${day.toISOString()}`} className="px-2 py-4 text-center font-bold text-stone-700">
                      {dayTotal > 0 ? `${dayTotal.toFixed(1)}h` : '-'}
                    </td>
                  );
                })}
                <td className="px-6 py-4 text-center font-bold text-[#00A3FF] text-lg">
                  {entries
                    .filter((e) => e.hours > 0)
                    .reduce((sum, e) => sum + e.hours, 0)
                    .toFixed(1)}
                  h
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white border border-stone-200 shadow-sm p-4 rounded-2xl">
        <button
          type="button"
          onClick={handleAddRow}
          disabled={!projects.length}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-widest uppercase text-stone-500 hover:text-stone-900 hover:bg-stone-50 rounded-lg border border-stone-200 transition-all disabled:opacity-40"
        >
          <Plus className="w-4 h-4" /> Add Row
        </button>

        <div className="flex gap-4">
          <button
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold tracking-widest uppercase text-stone-400 bg-stone-50 border border-stone-200 rounded-lg transition-all opacity-50 cursor-not-allowed"
            title="Use TMS approvals workflow when submit is available"
          >
            <Send className="w-4 h-4" /> Submit for Approval
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasDirty}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold tracking-widest uppercase bg-[#00A3FF] hover:bg-[#0090e0] text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
