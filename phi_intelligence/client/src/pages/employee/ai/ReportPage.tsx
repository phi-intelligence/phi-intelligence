import { useEffect, useRef, useState } from 'react';
import { tmsApi } from '@/services/tmsApi';
import { Loader2, FileText, Save, Sparkles, Upload, Eye, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type MyReport = {
  id: string;
  date: string;
  status: string;
  raw_content?: string;
  created_at?: string;
};

export default function ReportPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const [reportDate, setReportDate] = useState(today);
  const [content, setContent] = useState('');
  const [processed, setProcessed] = useState<any>(null);
  const [selectedActions, setSelectedActions] = useState<number[]>([]);

  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [history, setHistory] = useState<MyReport[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [previewReport, setPreviewReport] = useState<MyReport | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setHistoryLoading(true);
      const res = await tmsApi.get<{ data: MyReport[] }>('/reports/mine');
      setHistory(res.data || []);
    } catch (err: any) {
      // soft fail
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleSave() {
    if (!content.trim()) {
      toast({ title: 'Report is empty', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await tmsApi.post('/reports', { date: reportDate, content: content.trim() });
      toast({ title: 'Report saved' });
      loadHistory();
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function handleProcess() {
    if (!content.trim()) {
      toast({ title: 'Enter your daily report', variant: 'destructive' });
      return;
    }
    setProcessing(true);
    try {
      const res = await tmsApi.post<{ data: any }>('/ai/report/process', { content });
      setProcessed(res.data);
      const n = res.data?.actions?.length ?? 0;
      setSelectedActions(Array.from({ length: n }, (_, i) => i));
      toast({ title: 'Report processed by Gemini' });
    } catch (e: any) {
      toast({ title: 'Processing failed', description: e.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  }

  async function handleConfirm() {
    if (!processed?.actions || selectedActions.length === 0) {
      toast({ title: 'Select at least one action', variant: 'destructive' });
      return;
    }
    setConfirming(true);
    try {
      const actions = processed.actions.filter((_: any, i: number) => selectedActions.includes(i));
      await tmsApi.post('/ai/report/confirm', { actions });
      toast({ title: 'Actions applied' });
      setProcessed(null);
      setSelectedActions([]);
    } catch (e: any) {
      toast({ title: 'Confirmation failed', description: e.message, variant: 'destructive' });
    } finally {
      setConfirming(false);
    }
  }

  function toggleAction(index: number) {
    setSelectedActions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      toast({ title: 'File too large (max 1.5MB)', variant: 'destructive' });
      return;
    }
    const text = await file.text();
    setContent((c) => (c ? c + '\n\n' + text : text));
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: `Imported ${file.name}` });
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-rajdhani tracking-wider text-stone-900 uppercase flex items-center gap-3">
          <FileText className="w-6 h-6 text-[#00A3FF]" />
          Daily Report
        </h1>
        <p className="text-stone-500 mt-1 text-sm">
          Write or upload today’s report. Save it for your manager, then optionally process with Gemini.
        </p>
      </div>

      <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
            Report date
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="mt-1 block w-full sm:w-auto bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 text-sm focus:outline-none focus:border-[#00A3FF]"
            />
          </label>
          <div className="flex flex-1 gap-2 justify-end flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.markdown,.text"
              hidden
              onChange={handleFile}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 text-stone-600 text-xs font-semibold tracking-wider uppercase hover:bg-stone-50 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload .txt / .md
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !content.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold tracking-wider uppercase disabled:opacity-50 shadow-sm hover:bg-emerald-700"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save report
            </button>
            <button
              type="button"
              onClick={handleProcess}
              disabled={processing || !content.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00A3FF] text-white text-xs font-semibold tracking-wider uppercase disabled:opacity-50 shadow-sm hover:bg-[#0090e0]"
            >
              {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Analyze with AI
            </button>
          </div>
        </div>
        <textarea
          className="w-full min-h-[260px] bg-stone-50 border border-stone-200 rounded-xl p-4 text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF]/20"
          placeholder="What did you work on today? Describe completed tasks, hours spent, blockers, and next steps."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <p className="text-xs text-stone-400">
          Saving stores the raw text for the chosen date. Analyzing sends it to Gemini and proposes actions you can apply.
        </p>
      </div>

      {processed && (
        <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-stone-900">AI Summary</h2>
          <p className="text-stone-600 text-sm">{processed.summary}</p>
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Suggested actions</h3>
          <div className="space-y-2">
            {processed.actions?.map((action: any, i: number) => (
              <label
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer hover:bg-stone-100 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedActions.includes(i)}
                  onChange={() => toggleAction(i)}
                  className="mt-1 accent-[#00A3FF]"
                />
                <div className="flex-1 text-sm">
                  <span className="text-[#00A3FF] font-semibold mr-2">{action.type}</span>
                  <span className="text-stone-700">{action.description}</span>
                  {action.hours != null && (
                    <span className="text-stone-400 text-xs ml-2">({action.hours}h)</span>
                  )}
                </div>
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirming || selectedActions.length === 0}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold text-sm disabled:opacity-50 hover:bg-emerald-700 shadow-sm"
          >
            {confirming ? 'Applying…' : `Apply ${selectedActions.length} action(s)`}
          </button>
        </div>
      )}

      <div className="bg-white border border-stone-200 shadow-sm rounded-2xl">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-widest uppercase text-stone-700">My Reports</h2>
          <span className="text-xs text-stone-400">{history.length} saved</span>
        </div>
        {historyLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#00A3FF]" />
          </div>
        ) : history.length === 0 ? (
          <div className="px-6 py-8 text-sm text-stone-400">No reports yet. Write one above and click Save.</div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {history.map((r) => (
              <li key={r.id} className="px-6 py-4 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-stone-900 text-sm font-medium">{format(new Date(r.date), 'EEE, MMM d, yyyy')}</p>
                  <p className="text-xs uppercase tracking-widest text-stone-400 mt-0.5">{r.status}</p>
                </div>
                <button
                  onClick={() => setPreviewReport(r)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[80vh] overflow-y-auto bg-white border border-stone-200 shadow-2xl rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-stone-400">Daily report</p>
                <h3 className="text-lg font-bold text-stone-900 mt-0.5">
                  {format(new Date(previewReport.date), 'EEEE, MMMM d, yyyy')}
                </h3>
              </div>
              <button onClick={() => setPreviewReport(null)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-stone-700 bg-stone-50 p-4 rounded-xl border border-stone-200 font-mono">
              {previewReport.raw_content || '(empty)'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
