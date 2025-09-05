'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Clock, Calendar, Coffee, AlertTriangle, FileText } from 'lucide-react';
import { employeeApi, assignmentApi, logApi, breakApi, issueApi } from '@/lib/api-client';
import { Employee, Assignment, Break, Issue } from '@/types';
import { getCurrentISTDate, formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import WorkLogForm from './WorkLogForm';
import BreakTracker from './BreakTracker';
import IssueForm from './IssueForm';
import SubmissionHistory from './SubmissionHistory';

interface EmployeePanelProps {
  employee: Employee;
  onLogout: () => void;
}

export default function EmployeePanel({ employee, onLogout }: EmployeePanelProps) {
  const [selectedDate, setSelectedDate] = useState(getCurrentISTDate());
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [currentBreak, setCurrentBreak] = useState<Break | null>(null);
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the current date
  const today = useMemo(() => getCurrentISTDate(), []);

  // Update current date/time every 30 seconds instead of every second for better performance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  // Debounced data loading to prevent rapid API calls
  const loadEmployeeData = useCallback(async () => {
    if (!employee?.id) return;
    
    try {
      setLoading(true);
      setError(null);

      // Load data in parallel for better performance
      const [assignmentsResponse, breakResponse, issuesResponse] = await Promise.allSettled([
        assignmentApi.getByEmployee(employee.id),
        breakApi.getStatus(employee.id),
        issueApi.getByEmployee(employee.id),
      ]);

      // Handle assignments
      if (assignmentsResponse.status === 'fulfilled' && assignmentsResponse.value.data.success) {
        setAssignments(assignmentsResponse.value.data.data || []);
      } else if (assignmentsResponse.status === 'rejected') {
        console.error('Failed to load assignments:', assignmentsResponse.reason);
      }

      // Handle break status
      if (breakResponse.status === 'fulfilled' && breakResponse.value.data.success) {
        setCurrentBreak(breakResponse.value.data.data);
      } else if (breakResponse.status === 'rejected') {
        console.error('Failed to load break status:', breakResponse.reason);
      }

      // Handle issues
      if (issuesResponse.status === 'fulfilled' && issuesResponse.value.data.success) {
        const issuesData = issuesResponse.value.data.data || [];
        setRecentIssues(issuesData.slice(0, 5)); // Only keep recent 5 issues
      } else if (issuesResponse.status === 'rejected') {
        console.error('Failed to load issues:', issuesResponse.reason);
      }

    } catch (error) {
      console.error('Error loading employee data:', error);
      setError('Failed to load employee data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [employee.id]);

  // Load data only when employee changes
  useEffect(() => {
    loadEmployeeData();
  }, [loadEmployeeData]);

  // Check lock status when date changes
  const checkLockStatus = useCallback(async () => {
    if (!employee?.id || !selectedDate) return;
    
    try {
      const response = await logApi.getByDate(employee.id, selectedDate);
      // You would need to implement lock status check in the API response
      setIsLocked(false); // Default to unlocked for now
    } catch (error) {
      console.error('Error checking lock status:', error);
    }
  }, [employee.id, selectedDate]);

  useEffect(() => {
    checkLockStatus();
  }, [checkLockStatus]);

  // Optimized break handlers
  const handleBreakIn = useCallback(async () => {
    if (!employee?.id) return;
    
    try {
      const response = await breakApi.breakIn({ employeeId: employee.id });
      if (response.data.success) {
        toast.success('Break started');
        setCurrentBreak(response.data.data || null);
      }
    } catch (error) {
      toast.error('Failed to start break');
    }
  }, [employee.id]);

  const handleBreakOut = useCallback(async () => {
    if (!employee?.id) return;
    
    try {
      const response = await breakApi.breakOut({ employeeId: employee.id });
      if (response.data.success) {
        toast.success('Break ended');
        setCurrentBreak(null);
      }
    } catch (error) {
      toast.error('Failed to end break');
    }
  }, [employee.id]);

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleWorkLogSuccess = useCallback(() => {
    setIsLocked(true);
    toast.success('Work log submitted successfully!');
  }, []);

  const handleIssueSuccess = useCallback(() => {
    // Optimistically update recent issues instead of reloading all data
    loadEmployeeData();
    toast.success('Issue submitted successfully!');
  }, [loadEmployeeData]);

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 max-w-md">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadEmployeeData}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {employee.name}!
              </h1>
              <p className="text-sm text-gray-600">Employee Code: {employee.employeeCode}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatDateTime(currentDateTime)}
                </p>
                <p className="text-xs text-gray-500">IST</p>
              </div>
              <Button onClick={onLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Date Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Calendar className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold">Select Date for Work Log</h2>
              </div>
              <div className="flex items-center space-x-4">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  max={today}
                  className="w-auto"
                />
                {selectedDate !== today && (
                  <Button 
                    onClick={() => handleDateChange(today)} 
                    variant="outline"
                    size="sm"
                  >
                    Today
                  </Button>
                )}
              </div>
            </div>

            {/* Break Management */}
            <BreakTracker
              employeeId={employee.id}
              currentBreak={currentBreak}
              onBreakIn={handleBreakIn}
              onBreakOut={handleBreakOut}
            />

            {/* Work Log Form */}
            {isLocked ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-8">
                  <div className="bg-yellow-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Data Already Submitted
                  </h3>
                  <p className="text-gray-600">
                    Data for {new Date(selectedDate).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} has been submitted and locked.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    If you need to make changes, please contact your HR or Team Leader.
                  </p>
                </div>
              </div>
            ) : (
              <WorkLogForm
                employeeId={employee.id}
                selectedDate={selectedDate}
                assignments={assignments}
                onSubmitSuccess={handleWorkLogSuccess}
              />
            )}

            {/* Issue Form */}
            <IssueForm
              employeeId={employee.id}
              onSubmitSuccess={handleIssueSuccess}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Submission History */}
            <SubmissionHistory employeeId={employee.id} />

            {/* Recent Issues */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold">Recent Issues</h3>
              </div>
              
              {recentIssues.length > 0 ? (
                <div className="space-y-3">
                  {recentIssues.map((issue) => (
                    <div key={issue.id} className="border-l-4 border-blue-200 pl-3 py-2">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {issue.issueCategory}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          issue.issueStatus === 'resolved' 
                            ? 'bg-green-100 text-green-800'
                            : issue.issueStatus === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {issue.issueStatus.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {issue.issueDescription}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(issue.raisedDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No issues reported yet.</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Today's Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Break Status</span>
                  <span className={`text-sm font-medium ${
                    currentBreak?.isActive ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {currentBreak?.isActive ? 'On Break' : 'Working'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Date Status</span>
                  <span className={`text-sm font-medium ${
                    isLocked ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {isLocked ? 'Submitted' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Open Issues</span>
                  <span className="text-sm font-medium text-gray-900">
                    {recentIssues.filter(issue => issue.issueStatus !== 'resolved').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}