import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectApi } from '../../services/projectApi';
import { api } from '../../services/api';
import type { ProjectFormData, ProjectStatus, Priority, Region, User } from '../../types/project';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState<User[]>([]);
  
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    clientName: '',
    projectCode: '',
    startDate: '',
    endDate: '',
    estimatedHours: undefined,
    budget: undefined,
    projectLeadId: '',
    region: 'BOTH' as Region,
    priority: 'MEDIUM' as Priority,
    status: 'PLANNING' as ProjectStatus,
  });

  useEffect(() => {
    fetchEmployees();
    if (isEdit && id) {
      fetchProject(id);
    }
  }, [id]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/api/employees');
      setEmployees(response.data.data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const fetchProject = async (projectId: string) => {
    try {
      setLoading(true);
      const project = await projectApi.getProjectById(projectId);
      setFormData({
        name: project.name,
        description: project.description || '',
        clientName: project.clientName || '',
        projectCode: project.projectCode,
        startDate: project.startDate.split('T')[0],
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
        estimatedHours: project.estimatedHours,
        budget: project.budget,
        projectLeadId: project.projectLeadId,
        region: project.region,
        priority: project.priority,
        status: project.status,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isEdit && id) {
        await projectApi.updateProject(id, formData);
      } else {
        await projectApi.createProject(formData);
      }
      navigate('/projects');
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} project`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'estimatedHours' || name === 'budget'
          ? value === ''
            ? undefined
            : parseFloat(value)
          : value,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">
          {isEdit ? 'Edit Project' : 'Create New Project'}
        </h1>
        <p className="text-text-secondary mt-1">
          {isEdit ? 'Update project details' : 'Fill in the details to create a new project'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-card mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-card shadow-soft border-0 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project name"
            />
          </div>

          {/* Project Code */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Project Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="projectCode"
              value={formData.projectCode}
              onChange={handleInputChange}
              required
              disabled={isEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="e.g., PRJ-001"
            />
            {isEdit && (
              <p className="text-xs text-text-muted mt-1">Project code cannot be changed</p>
            )}
          </div>

          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Client Name</label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter client name"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project description"
            />
          </div>

          {/* Project Lead */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Project Lead <span className="text-red-500">*</span>
            </label>
            <select
              name="projectLeadId"
              value={formData.projectLeadId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Project Lead</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.email})
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PLANNING">Planning</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Region</label>
            <select
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="UK">UK</option>
              <option value="INDIA">India</option>
              <option value="BOTH">Both</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Estimated Hours */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Estimated Hours
            </label>
            <input
              type="number"
              name="estimatedHours"
              value={formData.estimatedHours || ''}
              onChange={handleInputChange}
              min="0"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 160"
            />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Budget (£/₹)</label>
            <input
              type="number"
              name="budget"
              value={formData.budget || ''}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 50000"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="px-6 py-2 border border-gray-300 text-text-secondary rounded-card hover:bg-gray-50 transition"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-card hover:bg-blue-700 transition disabled:bg-blue-400"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;





