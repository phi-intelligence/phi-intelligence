import { useState, useEffect } from 'react';
import { Link, useRoute } from 'wouter';
import { tmsApi } from '@/services/tmsApi';
import { useEmployee } from '@/contexts/EmployeeContext';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type FormState = {
  name: string;
  description: string;
  client_name: string;
  project_code: string;
  start_date: string;
  end_date: string;
  estimated_hours: string;
  budget: string;
  project_lead_id: string;
  region: string;
  priority: string;
  status: string;
};

const emptyForm: FormState = {
  name: '',
  description: '',
  client_name: '',
  project_code: '',
  start_date: '',
  end_date: '',
  estimated_hours: '',
  budget: '',
  project_lead_id: '',
  region: 'BOTH',
  priority: 'MEDIUM',
  status: 'PLANNING',
};

export default function ProjectFormPage() {
  const [isNewRoute] = useRoute('/employee/projects/new');
  const [isEditRoute, editParams] = useRoute('/employee/projects/:id/edit');
  const id = isEditRoute ? editParams?.id : undefined;
  const isEdit = Boolean(isEditRoute && id);
  const { user } = useEmployee();
  const { toast } = useToast();
  const [loading, setLoading] = useState(isEditRoute);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [leads, setLeads] = useState<{ id: string; label: string }[]>([]);

  useEffect(() => {
    const run = async () => {
      if (user?.role === 'ADMIN') {
        try {
          const res = await tmsApi.get<{ data: any[] }>('/employees');
          const list = Array.isArray(res.data) ? res.data : [];
          setLeads(
            list.map((e: any) => ({
              id: e.id,
              label:
                [e.profile?.first_name, e.profile?.last_name].filter(Boolean).join(' ') ||
                e.email ||
                e.username,
            }))
          );
        } catch {
          setLeads([]);
        }
      } else if (user?.id) {
        setLeads([{ id: user.id, label: 'You (project lead)' }]);
        setForm((f) => ({ ...f, project_lead_id: user.id }));
      }
    };
    run();
  }, [user]);

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await tmsApi.get<{ data: any }>(`/projects/${id}`);
        const p = res.data;
        if (!p) throw new Error('Missing project');
        setForm({
          name: p.name || '',
          description: p.description || '',
          client_name: p.client_name || '',
          project_code: p.project_code || '',
          start_date: p.start_date ? p.start_date.slice(0, 10) : '',
          end_date: p.end_date ? p.end_date.slice(0, 10) : '',
          estimated_hours: p.estimated_hours != null ? String(p.estimated_hours) : '',
          budget: p.budget != null ? String(p.budget) : '',
          project_lead_id: p.project_lead_id || '',
          region: p.region || 'BOTH',
          priority: p.priority || 'MEDIUM',
          status: p.status || 'PLANNING',
        });
      } catch {
        toast({ title: 'Error', description: 'Failed to load project', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, toast]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const startIso = form.start_date ? new Date(form.start_date + 'T12:00:00').toISOString() : null;
      if (!startIso) {
        toast({ title: 'Start date required', variant: 'destructive' });
        setSubmitting(false);
        return;
      }
      const endIso = form.end_date ? new Date(form.end_date + 'T12:00:00').toISOString() : null;
      if (isEdit && id) {
        await tmsApi.put(`/projects/${id}`, {
          name: form.name,
          description: form.description || null,
          client_name: form.client_name || null,
          status: form.status,
          start_date: startIso,
          end_date: endIso,
          estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : null,
          budget: form.budget ? parseFloat(form.budget) : null,
          priority: form.priority,
          project_lead_id: form.project_lead_id || undefined,
        });
        toast({ title: 'Project updated' });
        window.location.href = `/employee/projects/${id}`;
      } else {
        await tmsApi.post('/projects', {
          name: form.name,
          description: form.description || null,
          client_name: form.client_name || null,
          project_code: form.project_code,
          start_date: startIso,
          end_date: endIso,
          estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : null,
          budget: form.budget ? parseFloat(form.budget) : null,
          priority: form.priority,
          region: form.region,
          project_lead_id: form.project_lead_id,
        });
        toast({ title: 'Project created' });
        window.location.href = '/employee/projects';
      }
    } catch (err: any) {
      toast({
        title: 'Save failed',
        description: err.message || 'Could not save project',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isNewRoute && !isEditRoute) {
    return <p className="text-stone-400">Not found</p>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A3FF]" />
      </div>
    );
  }

  const inputCls =
    'w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF]/20';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/employee/projects">
          <span className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 text-sm cursor-pointer transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Projects
          </span>
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold font-rajdhani tracking-wider text-stone-900 uppercase">
          {isEdit ? 'Edit project' : 'New project'}
        </h1>
      </div>

      <form onSubmit={onSubmit} className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-stone-400 uppercase mb-2">Name *</label>
            <input name="name" value={form.name} onChange={onChange} required className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-400 uppercase mb-2">
              Project code *
            </label>
            <input
              name="project_code"
              value={form.project_code}
              onChange={onChange}
              required
              disabled={isEdit}
              className={inputCls + (isEdit ? ' opacity-60' : '')}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-400 uppercase mb-2">Client</label>
            <input name="client_name" value={form.client_name} onChange={onChange} className={inputCls} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-stone-400 uppercase mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={4}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-400 uppercase mb-2">Project lead *</label>
            <select
              name="project_lead_id"
              value={form.project_lead_id}
              onChange={onChange}
              required
              className={inputCls}
            >
              <option value="">Select</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-400 uppercase mb-2">Status</label>
            <select name="status" value={form.status} onChange={onChange} className={inputCls}>
              {['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'].map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-400 uppercase mb-2">Priority</label>
            <select name="priority" value={form.priority} onChange={onChange} className={inputCls}>
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-400 uppercase mb-2">Region</label>
            <select name="region" value={form.region} onChange={onChange} className={inputCls}>
              <option value="UK">UK</option>
              <option value="INDIA">India</option>
              <option value="BOTH">Both</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-400 uppercase mb-2">Start date *</label>
            <input name="start_date" type="date" value={form.start_date} onChange={onChange} required className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-400 uppercase mb-2">End date</label>
            <input name="end_date" type="date" value={form.end_date} onChange={onChange} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-400 uppercase mb-2">Est. hours</label>
            <input
              name="estimated_hours"
              type="number"
              step="0.5"
              min="0"
              value={form.estimated_hours}
              onChange={onChange}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-400 uppercase mb-2">Budget</label>
            <input
              name="budget"
              type="number"
              step="0.01"
              min="0"
              value={form.budget}
              onChange={onChange}
              className={inputCls}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
          <Link href="/employee/projects">
            <span className="inline-block px-5 py-2.5 rounded-lg border border-stone-200 text-stone-600 text-sm cursor-pointer hover:bg-stone-50 transition-colors">
              Cancel
            </span>
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-[#00A3FF] text-white font-semibold text-sm disabled:opacity-50 shadow-sm hover:bg-[#0090e0]"
          >
            {submitting ? 'Saving…' : isEdit ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
