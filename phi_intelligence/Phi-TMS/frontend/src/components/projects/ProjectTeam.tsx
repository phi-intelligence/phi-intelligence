import { useState, useEffect } from 'react';
import { projectApi } from '../../services/projectApi';
import type { ProjectMember } from '../../types/project';
import LoadingSpinner from '../LoadingSpinner';
import { UserPlus, Trash2, Edit2 } from 'lucide-react';
import AddTeamMemberModal from './AddTeamMemberModal';

interface ProjectTeamProps {
  projectId: string;
  canEdit: boolean;
  onUpdate: () => void;
}

const ProjectTeam = ({ projectId, canEdit, onUpdate }: ProjectTeamProps) => {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await projectApi.getProjectMembers(projectId);
      setMembers(data);
    } catch (err) {
      console.error('Failed to load team members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    try {
      await projectApi.removeTeamMember(projectId, userId);
      fetchMembers();
      onUpdate();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove team member');
    }
  };

  const handleMemberAdded = () => {
    setShowAddModal(false);
    fetchMembers();
    onUpdate();
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getInitials = (user: any): string => {
    if (!user) return '?';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-card shadow-soft border-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Team Members</h3>
          <p className="text-sm text-text-secondary mt-1">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-card hover:bg-blue-700 transition"
          >
            <UserPlus className="w-4 h-4" />
            Add Member
          </button>
        )}
      </div>

      {/* Team Members Table */}
      {members.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-text-muted text-5xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-text-primary mb-2">No team members yet</h3>
          <p className="text-text-secondary mb-4">Add team members to start collaborating on this project</p>
          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-card hover:bg-blue-700 transition"
            >
              Add First Member
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Allocation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Joined
                </th>
                {canEdit && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-text-primary font-medium text-sm">
                          {getInitials(member.user)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-text-primary">
                          {member.user ? `${member.user.firstName} ${member.user.lastName}` : 'Unknown'}
                        </div>
                        <div className="text-sm text-text-muted">
                          {member.user?.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-text-primary">{member.allocationPercentage}%</span>
                      <div className="ml-3 w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${member.allocationPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                    <div>
                      <span className="font-medium">{member.hoursLogged || 0}h</span>
                      {member.hoursAllocated && (
                        <span className="text-text-muted"> / {member.hoursAllocated}h</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                    {formatDate(member.joinedDate)}
                  </td>
                  {canEdit && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemoveMember(member.userId)}
                        className="text-red-600 hover:text-red-900 transition"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Team Member Modal */}
      {showAddModal && (
        <AddTeamMemberModal
          projectId={projectId}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleMemberAdded}
        />
      )}
    </div>
  );
};

export default ProjectTeam;






