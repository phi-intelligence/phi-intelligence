import { useState, useEffect } from 'react';
import { timelogApi } from '../../services/timelogApi';
import { projectApi } from '../../services/projectApi';
import { taskApi } from '../../services/taskApi';
import type { TimeLogFormData } from '../../types/timelog';
import type { Project, User } from '../../types/project';
import type { Task } from '../../types/task';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface TimeLogModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  prefilledProjectId?: string;
  prefilledTaskId?: string;
}

const TimeLogModal = ({
  onClose,
  onSuccess,
  prefilledProjectId,
  prefilledTaskId,
}: TimeLogModalProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<TimeLogFormData>({
    projectId: prefilledProjectId || '',
    taskId: prefilledTaskId,
    date: format(new Date(), 'yyyy-MM-dd'),
    hours: 0,
    description: '',
    isBillable: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (formData.projectId) {
      fetchTasks(formData.projectId);
    } else {
      setTasks([]);
    }
  }, [formData.projectId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectApi.getProjects({ status: 'ACTIVE' });
      setProjects(data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (projectId: string) => {
    try {
      const data = await taskApi.getProjectTasks(projectId);
      setTasks(data.filter((t) => t.status !== 'DONE'));
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setTasks([]);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else if (new Date(formData.date) > new Date()) {
      newErrors.date = 'Date cannot be in the future';
    }

    if (!formData.hours || formData.hours <= 0) {
      newErrors.hours = 'Hours must be greater than 0';
    } else if (formData.hours > 24) {
      newErrors.hours = 'Hours cannot exceed 24';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, addAnother = false) => {
    e.preventDefault();
    
    if (!validate()) return;

    setSubmitting(true);
    try {
      await timelogApi.logTime(formData);
      toast.success('Time logged successfully');
      
      if (addAnother) {
        // Reset form but keep project selection
        setFormData({
          ...formData,
          taskId: undefined,
          hours: 0,
          description: '',
        });
      } else {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to log time');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : name === 'hours'
          ? value === ''
            ? 0
            : parseFloat(value)
          : value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-card shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-text-primary">Log Time</h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-secondary transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Project Selector */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Project <span className="text-red-500">*</span>
                </label>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleInputChange}
                  disabled={!!prefilledProjectId}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.projectId ? 'border-red-300' : 'border-gray-300'
                  } ${prefilledProjectId ? 'bg-gray-100' : ''}`}
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.projectCode})
                    </option>
                  ))}
                </select>
                {errors.projectId && (
                  <p className="text-xs text-red-600 mt-1">{errors.projectId}</p>
                )}
              </div>

              {/* Task Selector */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Task (Optional)
                </label>
                <select
                  name="taskId"
                  value={formData.taskId || ''}
                  onChange={handleInputChange}
                  disabled={!formData.projectId || !!prefilledTaskId}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    (!formData.projectId || prefilledTaskId) ? 'bg-gray-100' : ''
                  }`}
                >
                  <option value="">No specific task</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.date && (
                  <p className="text-xs text-red-600 mt-1">{errors.date}</p>
                )}
              </div>

              {/* Hours Input */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Hours <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="hours"
                  value={formData.hours || ''}
                  onChange={handleInputChange}
                  min="0.1"
                  max="24"
                  step="0.5"
                  placeholder="e.g., 2.5"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.hours ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.hours && (
                  <p className="text-xs text-red-600 mt-1">{errors.hours}</p>
                )}
                <p className="text-xs text-text-muted mt-1">Enter hours in decimal format (0.1 - 24)</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  maxLength={500}
                  placeholder="What did you work on?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-text-muted mt-1">
                  {formData.description?.length || 0}/500 characters
                </p>
              </div>

              {/* Billable Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isBillable"
                  checked={formData.isBillable}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-text-primary focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-text-secondary">
                  Billable
                </label>
              </div>
            </div>
          )}

          {/* Actions */}
          {!loading && (
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-text-secondary rounded-card hover:bg-gray-50 transition"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="px-4 py-2 border border-blue-600 text-text-primary rounded-card hover:bg-blue-50 transition"
                disabled={submitting}
              >
                Submit & Add Another
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-card hover:bg-blue-700 transition disabled:bg-blue-400"
                disabled={submitting}
              >
                {submitting ? 'Logging...' : 'Submit & Close'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default TimeLogModal;






