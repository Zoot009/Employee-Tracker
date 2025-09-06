// src/components/admin/LeaveManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface LeaveRequest {
  id: number;
  employeeId: number;
  leaveType: 'FULL_LEAVE' | 'WORK_FROM_HOME' | 'SICK_LEAVE' | 'CASUAL_LEAVE' | 'EMERGENCY_LEAVE';
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  requestedAt: string;
  reviewedAt?: string;
  adminComments?: string;
  isUrgent: boolean;
  employee?: {
    id: number;
    name: string;
    employeeCode: string;
  };
}

export default function LeaveManagement() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'DENIED'>('all');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [adminComments, setAdminComments] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    loadLeaveRequests();
  }, [statusFilter]);

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      // API call would go here
      // const response = await leaveApi.getAll({ status: statusFilter });
      // setLeaveRequests(response.data.data || []);
      
      // Mock data for now
      const mockData: LeaveRequest[] = [
        {
          id: 1,
          employeeId: 1,
          leaveType: 'WORK_FROM_HOME',
          startDate: '2024-01-15',
          endDate: '2024-01-15',
          reason: 'Need to work from home due to personal reasons',
          status: 'PENDING',
          requestedAt: '2024-01-14T10:30:00Z',
          isUrgent: false,
          employee: {
            id: 1,
            name: 'John Doe',
            employeeCode: 'EMP001'
          }
        }
      ];
      setLeaveRequests(mockData);
    } catch (error) {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewLeave = async (request: LeaveRequest, decision: 'APPROVED' | 'DENIED') => {
    setIsReviewing(true);
    try {
      // API call would go here
      // await leaveApi.update(request.id, {
      //   status: decision,
      //   adminComments: adminComments.trim() || undefined,
      //   reviewedAt: new Date().toISOString()
      // });
      
      toast.success(`Leave request ${decision.toLowerCase()} successfully`);
      setSelectedRequest(null);
      setAdminComments('');
      loadLeaveRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update leave request');
    } finally {
      setIsReviewing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'DENIED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'DENIED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'FULL_LEAVE':
        return 'bg-blue-100 text-blue-800';
      case 'WORK_FROM_HOME':
        return 'bg-purple-100 text-purple-800';
      case 'SICK_LEAVE':
        return 'bg-red-100 text-red-800';
      case 'CASUAL_LEAVE':
        return 'bg-green-100 text-green-800';
      case 'EMERGENCY_LEAVE':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLeaveType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const calculateLeaveDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const filteredRequests = leaveRequests.filter(request => 
    statusFilter === 'all' || request.status === statusFilter
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Calendar className="h-7 w-7 mr-2 text-primary" />
            Leave Management
          </h1>
          <p className="text-muted-foreground mt-1">Review and manage employee leave requests</p>
        </div>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="DENIED">Denied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{leaveRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {leaveRequests.filter(r => r.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">
                  {leaveRequests.filter(r => r.status === 'APPROVED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Denied</p>
                <p className="text-2xl font-bold">
                  {leaveRequests.filter(r => r.status === 'DENIED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No leave requests found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No leave requests found for the selected filter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(request.status)}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {request.employee?.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {request.employee?.employeeCode} • 
                            Requested {new Date(request.requestedAt).toLocaleDateString()}
                          </p>
                        </div>
                        {request.isUrgent && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                            Urgent
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <Label className="text-xs text-gray-500">Leave Type</Label>
                          <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getLeaveTypeColor(request.leaveType)}`}>
                            {formatLeaveType(request.leaveType)}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Duration</Label>
                          <p className="text-sm font-medium">
                            {new Date(request.startDate).toLocaleDateString()} - 
                            {new Date(request.endDate).toLocaleDateString()}
                            <span className="text-gray-500 ml-1">
                              ({calculateLeaveDays(request.startDate, request.endDate)} day(s))
                            </span>
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Status</Label>
                          <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </div>
                        </div>
                      </div>
                      
                      {request.reason && (
                        <div className="mb-3">
                          <Label className="text-xs text-gray-500">Reason</Label>
                          <p className="text-sm text-gray-700">{request.reason}</p>
                        </div>
                      )}
                      
                      {request.adminComments && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <Label className="text-xs text-blue-900">Admin Comments</Label>
                          <p className="text-sm text-blue-800">{request.adminComments}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {request.status === 'PENDING' && (
                        <Button
                          onClick={() => setSelectedRequest(request)}
                          variant="outline"
                          size="sm"
                        >
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Review Leave Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  {selectedRequest.employee?.name}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {formatLeaveType(selectedRequest.leaveType)} • 
                  {calculateLeaveDays(selectedRequest.startDate, selectedRequest.endDate)} day(s)
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(selectedRequest.startDate).toLocaleDateString()} - 
                  {new Date(selectedRequest.endDate).toLocaleDateString()}
                </p>
                {selectedRequest.reason && (
                  <p className="text-sm text-gray-700 mt-2">{selectedRequest.reason}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="adminComments">Admin Comments (Optional)</Label>
                <Textarea
                  id="adminComments"
                  value={adminComments}
                  onChange={(e) => setAdminComments(e.target.value)}
                  placeholder="Add comments about the decision..."
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => handleReviewLeave(selectedRequest, 'APPROVED')}
                  disabled={isReviewing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleReviewLeave(selectedRequest, 'DENIED')}
                  disabled={isReviewing}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Deny
                </Button>
              </div>
              
              <Button
                onClick={() => {
                  setSelectedRequest(null);
                  setAdminComments('');
                }}
                variant="outline"
                className="w-full"
                disabled={isReviewing}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
