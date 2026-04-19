import { useState, useEffect } from 'react';
import type { Task, TaskStatus } from '../../types/task';
import { Priority } from '../../types/project';
import { TaskStatus as TaskStatusEnum } from '../../types/task';
import { Search, X } from 'lucide-react';

interface TaskFiltersProps {
  tasks: Task[];
  onFilter: (filtered: Task[]) => void;
}

const TaskFilters = ({ tasks, onFilter }: TaskFiltersProps) => {
  const [search, setSearch] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>([]);

  useEffect(() => {
    applyFilters();
  }, [search, selectedAssignees, selectedPriorities, selectedStatuses, tasks]);

  const applyFilters = () => {
    let filtered = [...tasks];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
      );
    }

    // Assignee filter
    if (selectedAssignees.length > 0) {
      filtered = filtered.filter(
        (task) => task.assigneeId && selectedAssignees.includes(task.assigneeId)
      );
    }

    // Priority filter
    if (selectedPriorities.length > 0) {
      filtered = filtered.filter((task) => selectedPriorities.includes(task.priority));
    }

    // Status filter
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((task) => selectedStatuses.includes(task.status));
    }

    onFilter(filtered);
  };

  const getUniqueAssignees = () => {
    const assignees = tasks
      .filter((task) => task.assignee)
      .map((task) => task.assignee!);
    
    const unique = assignees.filter(
      (assignee, index, self) =>
        self.findIndex((a) => a.id === assignee.id) === index
    );
    
    return unique;
  };

  const handleAssigneeToggle = (assigneeId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(assigneeId)
        ? prev.filter((id) => id !== assigneeId)
        : [...prev, assigneeId]
    );
  };

  const handlePriorityToggle = (priority: Priority) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedAssignees([]);
    setSelectedPriorities([]);
    setSelectedStatuses([]);
  };

  const hasActiveFilters =
    search || selectedAssignees.length > 0 || selectedPriorities.length > 0 || selectedStatuses.length > 0;

  const assignees = getUniqueAssignees();

  return (
    <div className="bg-white rounded-card shadow-soft border-0 p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Assignee Filter */}
        {assignees.length > 0 && (
          <div className="relative">
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handleAssigneeToggle(e.target.value);
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none pr-8 bg-white"
            >
              <option value="">Assignee</option>
              {assignees.map((assignee) => (
                <option key={assignee.id} value={assignee.id}>
                  {assignee.firstName} {assignee.lastName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Priority Filter */}
        <div className="flex gap-2">
          {Object.values(Priority).map((priority) => (
            <button
              key={priority}
              onClick={() => handlePriorityToggle(priority)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                selectedPriorities.includes(priority)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-text-secondary border-gray-300 hover:bg-gray-50'
              }`}
            >
              {priority}
            </button>
          ))}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {(selectedAssignees.length > 0 || selectedPriorities.length > 0) && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
          {selectedAssignees.map((assigneeId) => {
            const assignee = assignees.find((a) => a.id === assigneeId);
            if (!assignee) return null;
            return (
              <span
                key={assigneeId}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
              >
                {assignee.firstName} {assignee.lastName}
                <button
                  onClick={() => handleAssigneeToggle(assigneeId)}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskFilters;






