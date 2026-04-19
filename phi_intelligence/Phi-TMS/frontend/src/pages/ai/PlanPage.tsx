import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export default function PlanPage() {
  const [plan, setPlan] = useState('');
  const [projectId, setProjectId] = useState('');
  const [analyzed, setAnalyzed] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!plan) return toast.error('Enter a plan');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/plan/analyze', { plan });
      setAnalyzed(data.data);
      toast.success('Plan analyzed');
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!projectId) return toast.error('Select a project');
    if (!analyzed) return toast.error('Analyze a plan first');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/plan/apply', { plan: analyzed, project_id: projectId });
      toast.success(`Created ${data.data.created_tasks?.length || 0} tasks`);
      navigate(`/projects/${projectId}/tasks`);
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Apply failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">AI Project Planner</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Project Plan (Markdown)</label>
        <textarea
          className="w-full p-3 border rounded h-48 font-mono text-sm"
          placeholder="## Phase 1: Setup&#10;- Task 1: Set up repository&#10;- Task 2: Configure CI/CD"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
        />
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading || !plan}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mr-4"
      >
        {loading ? 'Analyzing...' : 'Analyze Plan'}
      </button>

      {analyzed && (
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h2 className="font-semibold mb-2">{analyzed.title}</h2>
          <p className="text-sm text-gray-600 mb-4">{analyzed.summary}</p>
          
          {analyzed.phases?.map((phase: any, i: number) => (
            <div key={i} className="mb-4">
              <h3 className="font-medium">{phase.name}</h3>
              <ul className="text-sm ml-4">
                {phase.tasks?.map((task: any, j: number) => (
                  <li key={j}>- {task.title} ({task.priority}, {task.estimated_hours || '?'}h)</li>
                ))}
              </ul>
            </div>
          ))}

          <div className="mt-4 pt-4 border-t">
            <label className="block text-sm font-medium mb-1">Apply to Project</label>
            <input
              type="number"
              className="p-2 border rounded w-32 mr-2"
              placeholder="Project ID"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            />
            <button
              onClick={handleApply}
              disabled={loading || !projectId}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              Apply & Create Tasks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
