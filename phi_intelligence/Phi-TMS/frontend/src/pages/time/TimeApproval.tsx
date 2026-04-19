import { useState, useEffect } from 'react';
import { timelogApi } from '../../services/timelogApi';
import type { TimeLog } from '../../types/timelog';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Check, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const TimeApproval = () => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const data = await timelogApi.getPendingApprovals();
      setTimeLogs(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await timelogApi.approveTimeLog(id);
      toast.success('Time log approved');
      fetchPendingApprovals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve time log');
    }
  };

  const handleReject = async () => {
    if (!showRejectModal || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setSubmitting(true);
    try {
      await timelogApi.rejectTimeLog(showRejectModal, rejectionReason);
      toast.success('Time log rejected');
      setShowRejectModal(null);
      setRejectionReason('');
      fetchPendingApprovals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject time log');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Time Log Approvals</h1>
        <p className="text-text-secondary mt-1">
          {timeLogs.length} pending approval{timeLogs.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Approvals Table */}
      {timeLogs.length === 0 ? (
        <div className="bg-white rounded-card shadow-soft border-0 p-12 text-center">
          <div className="text-text-muted text-5xl mb-4">✅</div>
          <h3 className="text-lg font-medium text-text-primary mb-2">No pending approvals</h3>
          <p className="text-text-secondary">All time logs have been reviewed</p>
        </div>
      ) : (
        <div className="bg-white rounded-card shadow-soft border-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text-primary">
                        {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Unknown'}
                      </div>
                      <div className="text-sm text-text-muted">{log.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-primary">{log.project?.name || 'Unknown'}</div>
                      <div className="text-xs text-text-muted">{log.project?.projectCode}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-primary max-w-xs truncate">
                        {log.task?.title || 'No specific task'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-primary">
                        {format(new Date(log.date), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-text-primary">{log.hours}h</span>
                      {log.isBillable && (
                        <span className="ml-2 text-xs text-green-600">Billable</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-primary max-w-xs truncate">
                        {log.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApprove(log.id)}
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition"
                          title="Approve"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setShowRejectModal(log.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition"
                          title="Reject"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Reject Time Log</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  placeholder="Please provide a reason for rejecting this time log..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-text-muted mt-1">Minimum 10 characters required</p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(null);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-text-secondary rounded-card hover:bg-gray-50 transition"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={submitting || rejectionReason.trim().length < 10}
                  className="px-4 py-2 bg-red-600 text-white rounded-card hover:bg-red-700 transition disabled:bg-red-400 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Rejecting...' : 'Reject Time Log'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeApproval;





