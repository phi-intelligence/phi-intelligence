import { useState, useEffect } from 'react';
import { projectApi } from '../../services/projectApi';
import { api } from '../../services/api';
import type { User, ProjectMemberFormData } from '../../types/project';
import { X } from 'lucide-react';

interface AddTeamMemberModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AddTeamMemberModal = ({ projectId, onClose, onSuccess }: AddTeamMemberModalProps) => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [currentMembers, setCurrentMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<ProjectMemberFormData>({
    userId: '',
    role: 'DEVELOPER',
    allocationPercentage: 100,
    hoursAllocated: undefined,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeesData, membersData] = await Promise.all([
        api.get('/api/employees'),
        projectApi.getProjectMembers(projectId),
      ]);
      
      setEmployees(employeesData.data.data);
      setCurrentMembers(membersData.map((m) => m.userId));
    } catch (err) {
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await projectApi.addTeamMember(projectId, formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add team member');
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'allocationPercentage' || name === 'hoursAllocated'
          ? value === ''
            ? undefined
            : parseInt(value, 10)
          : value,
    }));
  };

  const availableEmployees = employees.filter((emp) => !currentMembers.includes(emp.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-card shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-text-primary">Add Team Member</h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-secondary transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-card text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : availableEmployees.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-secondary">All employees are already members of this project</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Employee Selector */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Employee <span className="text-red-500">*</span>
                </label>
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an employee</option>
                  {availableEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., DEVELOPER, DESIGNER, QA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-text-muted mt-1">
                  Common roles: DEVELOPER, DESIGNER, QA, TECH_LEAD, ANALYST
                </p>
              </div>

              {/* Allocation Percentage */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Allocation Percentage
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    name="allocationPercentage"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.allocationPercentage}
                    onChange={handleInputChange}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-text-primary w-12 text-right">
                    {formData.allocationPercentage}%
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  How much of their time will they dedicate to this project?
                </p>
              </div>

              {/* Hours Allocated */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Hours Allocated (Optional)
                </label>
                <input
                  type="number"
                  name="hoursAllocated"
                  value={formData.hoursAllocated || ''}
                  onChange={handleInputChange}
                  min="0"
                  step="0.5"
                  placeholder="e.g., 80"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-text-muted mt-1">
                  Total hours allocated for this member on the project
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          {!loading && availableEmployees.length > 0 && (
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
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-card hover:bg-blue-700 transition disabled:bg-blue-400"
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddTeamMemberModal;






