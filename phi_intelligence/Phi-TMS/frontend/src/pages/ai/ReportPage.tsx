import { useState } from 'react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export default function ReportPage() {
  const [content, setContent] = useState('');
  const [processed, setProcessed] = useState<any>(null);
  const [selectedActions, setSelectedActions] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const handleProcess = async () => {
    if (!content) return toast.error('Enter your daily report');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/report/process', { content });
      setProcessed(data.data);
      setSelectedActions(data.data.actions?.map((_: any, i: number) => i) || []);
      toast.success('Report processed');
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Processing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (selectedActions.length === 0) return toast.error('Select at least one action');
    setLoading(true);
    try {
      const actions = processed.actions.filter((_: any, i: number) => selectedActions.includes(i));
      const { data } = await api.post('/ai/report/confirm', { actions });
      toast.success('Actions applied');
      setProcessed(null);
      setContent('');
      setSelectedActions([]);
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleAction = (index: number) => {
    setSelectedActions(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Daily Report AI</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">What did you work on today?</label>
        <textarea
          className="w-full p-3 border rounded h-48"
          placeholder="Today I worked on the authentication module. Fixed the login bug, added JWT token refresh, and updated the user profile page. Also had a meeting with the team about the new feature."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <button
        onClick={handleProcess}
        disabled={loading || !content}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Process with AI'}
      </button>

      {processed && (
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h2 className="font-semibold mb-2">Summary</h2>
          <p className="text-sm text-gray-600 mb-4">{processed.summary}</p>
          
          <h3 className="font-medium mb-2">Extracted Actions</h3>
          {processed.actions?.map((action: any, i: number) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-white border rounded mb-2">
              <input
                type="checkbox"
                checked={selectedActions.includes(i)}
                onChange={() => toggleAction(i)}
                className="mt-1"
              />
              <div className="flex-1">
                <span className="inline-block px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800 mr-2">
                  {action.type}
                </span>
                <span className="text-sm">{action.description}</span>
                {action.hours && <span className="text-xs text-gray-500 ml-2">({action.hours}h)</span>}
              </div>
            </div>
          ))}

          <div className="mt-4 pt-4 border-t">
            <button
              onClick={handleConfirm}
              disabled={loading || selectedActions.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              Confirm & Apply {selectedActions.length} Actions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
