import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { LeaveRequest, LeaveType, LeaveBalance, PublicHoliday } from '@/types';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  addDays,
  differenceInDays,
  parseISO,
  isWeekend,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Eye,
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusBadge from '@/components/StatusBadge';
import toast from 'react-hot-toast';

type TabType = 'request' | 'balance' | 'calendar';

const Leaves = () => {
  const [activeTab, setActiveTab] = useState<TabType>('request');
  const [loading, setLoading] = useState(true);

  // Request tab state
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [requestForm, setRequestForm] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [validationError, setValidationError] = useState('');

  // Balance tab state
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Calendar tab state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [filters, setFilters] = useState({
    myLeaveOnly: false,
    showTeamLeave: true,
    showHolidays: true,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'balance') {
      fetchLeaveBalances();
    } else if (activeTab === 'calendar') {
      fetchCalendarData();
    }
  }, [activeTab, selectedYear, currentMonth]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchLeaveTypes(),
        fetchLeaveBalances(),
        fetchMyRequests(),
      ]);
    } catch (error) {
      toast.error('Failed to load leave data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveTypes = async () => {
    const response = await api.get('/leave/types');
    setLeaveTypes(response.data.data);
  };

  const fetchLeaveBalances = async () => {
    const response = await api.get(`/leave/balance?year=${selectedYear}`);
    setLeaveBalances(response.data.data);
  };

  const fetchMyRequests = async () => {
    const response = await api.get('/leave/my-requests');
    setMyRequests(response.data.data);
  };

  const fetchCalendarData = async () => {
    try {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      
      const [calendarResponse, holidaysResponse] = await Promise.all([
        api.get(`/leave/calendar?startDate=${start.toISOString()}&endDate=${end.toISOString()}`),
        api.get(`/leave/holidays?year=${currentMonth.getFullYear()}&region=UK`),
      ]);
      
      setCalendarData(calendarResponse.data.data);
      setHolidays(holidaysResponse.data.data);
    } catch (error) {
      toast.error('Failed to load calendar data');
    }
  };

  const calculateWorkingDays = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    let days = 0;
    
    for (let d = start; d <= end; d = addDays(d, 1)) {
      if (!isWeekend(d)) {
        days++;
      }
    }
    
    return days;
  };

  const validateRequest = () => {
    if (!requestForm.leaveTypeId) {
      return 'Please select a leave type';
    }
    
    if (!requestForm.startDate || !requestForm.endDate) {
      return 'Please select start and end dates';
    }
    
    if (new Date(requestForm.startDate) < new Date()) {
      return 'Start date cannot be in the past';
    }
    
    if (new Date(requestForm.endDate) < new Date(requestForm.startDate)) {
      return 'End date must be after start date';
    }
    
    if (requestForm.reason.length < 10) {
      return 'Reason must be at least 10 characters';
    }
    
    if (requestForm.reason.length > 500) {
      return 'Reason must not exceed 500 characters';
    }
    
    const requestedDays = calculateWorkingDays(requestForm.startDate, requestForm.endDate);
    const selectedBalance = leaveBalances.find(b => b.leaveTypeId === requestForm.leaveTypeId);
    
    if (selectedBalance && requestedDays > selectedBalance.remainingDays) {
      return `Insufficient balance. You have ${selectedBalance.remainingDays} days remaining`;
    }
    
    return null;
  };

  const handleSubmitRequest = async () => {
    const error = validateRequest();
    if (error) {
      setValidationError(error);
      return;
    }
    
    setSubmitting(true);
    try {
      const requestedDays = calculateWorkingDays(requestForm.startDate, requestForm.endDate);
      
      await api.post('/leave/request', {
        ...requestForm,
        totalDays: requestedDays,
      });
      
      toast.success('Leave request submitted successfully');
      setRequestForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
      setValidationError('');
      fetchMyRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
    
    try {
      await api.delete(`/leave/requests/${id}`);
      toast.success('Leave request cancelled');
      fetchMyRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel request');
    }
  };

  const tabs = [
    { id: 'request', label: 'Request Leave', icon: Plus },
    { id: 'balance', label: 'Leave Balance', icon: Clock },
    { id: 'calendar', label: 'Leave Calendar', icon: CalendarIcon },
  ];

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
        <h1 className="text-3xl font-bold text-text-primary">Leaves</h1>
        <p className="text-text-secondary mt-1">Manage your leave requests and view balances</p>
      </div>

      {/* Tabs as Pills */}
      <div className="mb-6">
        <nav className="flex space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`pill flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-accent text-text-primary shadow-soft-lg'
                    : 'hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'request' && (
          <RequestTab
            leaveTypes={leaveTypes}
            leaveBalances={leaveBalances}
            myRequests={myRequests}
            requestForm={requestForm}
            setRequestForm={setRequestForm}
            validationError={validationError}
            setValidationError={setValidationError}
            submitting={submitting}
            onSubmit={handleSubmitRequest}
            onCancelRequest={handleCancelRequest}
            onRefresh={fetchMyRequests}
          />
        )}
        
        {activeTab === 'balance' && (
          <BalanceTab
            leaveBalances={leaveBalances}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            onRefresh={fetchLeaveBalances}
          />
        )}
        
        {activeTab === 'calendar' && (
          <CalendarTab
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            calendarData={calendarData}
            holidays={holidays}
            filters={filters}
            setFilters={setFilters}
            onRefresh={fetchCalendarData}
          />
        )}
      </div>
    </div>
  );
};

// Request Tab Component
const RequestTab = ({
  leaveTypes,
  leaveBalances,
  myRequests,
  requestForm,
  setRequestForm,
  validationError,
  setValidationError,
  submitting,
  onSubmit,
  onCancelRequest,
  onRefresh,
}: any) => {
  const selectedBalance = leaveBalances.find((b: any) => b.leaveTypeId === requestForm.leaveTypeId);
  const requestedDays = requestForm.startDate && requestForm.endDate 
    ? calculateWorkingDays(requestForm.startDate, requestForm.endDate)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Request Form */}
      <div className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Submit Leave Request</h3>
        
        <div className="space-y-4">
          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <select
              value={requestForm.leaveTypeId}
              onChange={(e) => {
                setRequestForm({ ...requestForm, leaveTypeId: e.target.value });
                setValidationError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select leave type</option>
              {leaveTypes.map((type: any) => {
                const balance = leaveBalances.find((b: any) => b.leaveTypeId === type.id);
                return (
                  <option key={type.id} value={type.id} disabled={!balance || balance.remainingDays === 0}>
                    {type.name} ({balance ? `${balance.remainingDays} days remaining` : 'No balance'})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={requestForm.startDate}
                onChange={(e) => {
                  setRequestForm({ ...requestForm, startDate: e.target.value });
                  setValidationError('');
                }}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={requestForm.endDate}
                onChange={(e) => {
                  setRequestForm({ ...requestForm, endDate: e.target.value });
                  setValidationError('');
                }}
                min={requestForm.startDate || format(new Date(), 'yyyy-MM-dd')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Days Calculation */}
          {requestedDays > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Requesting:</strong> {requestedDays} working day{requestedDays !== 1 ? 's' : ''}
                {selectedBalance && (
                  <span className="ml-2">
                    (Remaining: {selectedBalance.remainingDays - requestedDays} days)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={requestForm.reason}
              onChange={(e) => {
                setRequestForm({ ...requestForm, reason: e.target.value });
                setValidationError('');
              }}
              rows={4}
              placeholder="Please provide reason for leave request..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="text-xs text-text-muted mt-1">
              {requestForm.reason.length}/500 characters
            </div>
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                {validationError}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={onSubmit}
            disabled={submitting || !requestForm.leaveTypeId || !requestForm.startDate || !requestForm.endDate || !requestForm.reason}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-card hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Leave Request'}
          </button>
        </div>
      </div>

      {/* My Requests */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          My Requests ({myRequests.length})
        </h3>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {myRequests.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No leave requests yet</p>
            </div>
          ) : (
            myRequests.map((request: any) => (
              <div key={request.id} className="p-3 bg-gray-50 rounded-card border-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-text-primary">{request.leaveType.name}</div>
                  <StatusBadge status={request.status} size="sm" />
                </div>
                <div className="text-sm text-text-secondary mb-2">
                  {format(parseISO(request.startDate), 'MMM d')} - {format(parseISO(request.endDate), 'MMM d, yyyy')}
                  <span className="ml-2 text-text-primary">({request.totalDays} days)</span>
                </div>
                <div className="text-xs text-text-muted mb-3 truncate">
                  {request.reason}
                </div>
                <div className="flex gap-2">
                  {request.status === 'PENDING' && (
                    <button
                      onClick={() => onCancelRequest(request.id)}
                      className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                    >
                      Cancel
                    </button>
                  )}
                  <button className="px-2 py-1 text-xs bg-gray-100 text-text-secondary rounded hover:bg-gray-200 transition">
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Balance Tab Component
const BalanceTab = ({ leaveBalances, selectedYear, setSelectedYear, onRefresh }: any) => {
  const years = [2024, 2025, 2026];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Leave Balance for {selectedYear}</h3>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {leaveBalances.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No Leave Types Assigned</h3>
          <p className="text-text-secondary mb-4">Contact your administrator to set up leave types</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-card hover:bg-blue-700 transition">
            Contact Administrator
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaveBalances.map((balance: any) => {
            const percentage = (balance.remainingDays / balance.totalDays) * 100;
            const colorClass = percentage > 50 ? 'bg-green-500' : percentage > 25 ? 'bg-yellow-500' : 'bg-red-500';
            
            return (
              <div key={balance.id} className="bg-white border-0 rounded-card p-6">
                <h4 className="text-lg font-semibold text-text-primary mb-4">{balance.leaveType.name}</h4>
                
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-text-primary">{balance.remainingDays}</div>
                  <div className="text-sm text-text-secondary">days remaining</div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-text-secondary mb-1">
                    <span>Progress</span>
                    <span>{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className={`h-2 rounded-full ${colorClass}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-sm text-text-secondary">
                  <div className="flex justify-between">
                    <span>Used:</span>
                    <span>{balance.usedDays} of {balance.totalDays} days</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Calendar Tab Component
const CalendarTab = ({ currentMonth, setCurrentMonth, calendarData, holidays, filters, setFilters, onRefresh }: any) => {
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div>
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-card transition">
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <div className="text-lg font-semibold text-text-primary min-w-[180px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </div>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-card transition">
            <ChevronRight className="w-5 h-5 text-text-secondary" />
          </button>
          <button onClick={handleToday} className="px-4 py-2 text-sm text-text-primary hover:bg-blue-50 rounded-card transition">
            Today
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.myLeaveOnly}
              onChange={(e) => setFilters({ ...filters, myLeaveOnly: e.target.checked })}
              className="rounded"
            />
            My Leave Only
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.showTeamLeave}
              onChange={(e) => setFilters({ ...filters, showTeamLeave: e.target.checked })}
              className="rounded"
            />
            Team Leave
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.showHolidays}
              onChange={(e) => setFilters({ ...filters, showHolidays: e.target.checked })}
              className="rounded"
            />
            Holidays
          </label>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>My Leave (Approved)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>My Leave (Pending)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded"></div>
          <span>Team Leave</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Public Holiday</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-card shadow-soft border-0 overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="p-4 text-center text-sm font-medium text-text-secondary">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {weeks.map((week, weekIdx) =>
            week.map((day, dayIdx) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);
              const dayStr = format(day, 'yyyy-MM-dd');
              
              // Get events for this day
              const dayEvents = [
                ...calendarData.filter((event: any) => 
                  event.startDate <= dayStr && event.endDate >= dayStr
                ),
                ...holidays.filter((holiday: any) => 
                  format(parseISO(holiday.date), 'yyyy-MM-dd') === dayStr
                ),
              ];

              return (
                <div
                  key={`${weekIdx}-${dayIdx}`}
                  className={`min-h-[100px] p-2 border-b border-r border-gray-200 ${
                    !isCurrentMonth ? 'opacity-40' : ''
                  } ${isCurrentDay ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-medium ${
                      isCurrentMonth ? 'text-text-primary' : 'text-text-muted'
                    }`}>
                      {format(day, 'd')}
                    </span>
                  </div>
                  
                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event: any, idx: number) => (
                      <div
                        key={idx}
                        className={`text-xs px-1 py-0.5 rounded text-white truncate ${
                          event.type === 'holiday' ? 'bg-red-500' :
                          event.status === 'APPROVED' ? 'bg-blue-500' :
                          event.status === 'PENDING' ? 'bg-yellow-500' :
                          'bg-purple-500'
                        }`}
                        title={event.title || event.name}
                      >
                        {event.title || event.name}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-text-muted">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function for calculating working days
const calculateWorkingDays = (startDate: string, endDate: string) => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  let days = 0;
  
  for (let d = start; d <= end; d = addDays(d, 1)) {
    if (!isWeekend(d)) {
      days++;
    }
  }
  
  return days;
};

export default Leaves;





