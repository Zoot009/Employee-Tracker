// src/app/admin/issues/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FileText, Clock, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { issueApi } from '@/lib/api-client';
import { Issue } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [newStatus, setNewStatus] = useState<'pending' | 'in_progress' | 'resolved'>('pending');
  const [updating, setUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      const response = await issueApi.getAll();
      if (response.data.success) {
        setIssues(response.data.data || []);
      } else {
        toast.error('Failed to load issues');
      }
    } catch (error: any) {
      console.error('Error loading issues:', error);
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIssue = async () => {
    if (!selectedIssue) return;

    setUpdating(true);
    try {
      const response = await issueApi.update(selectedIssue.id, {
        issueStatus: newStatus,
        adminResponse: adminResponse.trim() || undefined,
      });

      if (response.data.success) {
        toast.success('Issue updated successfully');
        loadIssues();
        closeDialog();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update issue';
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const openUpdateDialog = (issue: Issue) => {
    setSelectedIssue(issue);
    setNewStatus(issue.issueStatus);
    setAdminResponse(issue.adminResponse || '');
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedIssue(null);
    setAdminResponse('');
    setNewStatus('pending');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'resolved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'in_progress':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-red-100 text-red-800`;
    }
  };

  const filteredIssues = issues.filter(issue => 
    statusFilter === 'all' || issue.issueStatus === statusFilter
  );

  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.issueStatus === 'pending').length,
    inProgress: issues.filter(i => i.issueStatus === 'in_progress').length,
    resolved: issues.filter(i => i.issueStatus === 'resolved').length,
  };

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
            <FileText className="h-7 w-7 mr-2 text-primary" />
            Issue Management
          </h1>
          <p className="text-muted-foreground mt-1">Review and respond to employee issues</p>
        </div>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Issues</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Issues</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues List */}
      {filteredIssues.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No issues found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {statusFilter === 'all' 
                ? 'No issues have been reported yet.'
                : `No ${statusFilter.replace('_', ' ')} issues found.`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredIssues.map((issue) => (
                <div key={issue.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(issue.issueStatus)}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {issue.issueCategory}
                          </h3>
                          <p className="text-sm text-gray-600">
                            by {issue.employee?.name} • {issue.employee?.employeeCode}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{issue.issueDescription}</p>
                      
                      {issue.adminResponse && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <MessageSquare className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">Admin Response</span>
                          </div>
                          <p className="text-sm text-blue-800">{issue.adminResponse}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Raised: {new Date(issue.raisedDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{issue.daysElapsed} days elapsed</span>
                        {issue.resolvedDate && (
                          <>
                            <span>•</span>
                            <span>Resolved: {new Date(issue.resolvedDate).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={getStatusBadge(issue.issueStatus)}>
                        {issue.issueStatus.replace('_', ' ')}
                      </span>
                      <Button
                        onClick={() => openUpdateDialog(issue)}
                        variant="outline"
                        size="sm"
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update Issue Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Issue</DialogTitle>
            <DialogDescription>
              Update the status and provide a response for this issue.
            </DialogDescription>
          </DialogHeader>
          
          {selectedIssue && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">{selectedIssue.issueCategory}</h4>
                <p className="text-sm text-gray-600 mb-2">
                  by {selectedIssue.employee?.name}
                </p>
                <p className="text-sm text-gray-700">{selectedIssue.issueDescription}</p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="adminResponse">Admin Response</Label>
                <Textarea
                  id="adminResponse"
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Provide a response or update to the employee..."
                  rows={4}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleUpdateIssue} disabled={updating}>
              {updating ? 'Updating...' : 'Update Issue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}