// src/components/admin/NotificationManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Bell, Send, Users, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Notification {
  id: number;
  employeeId: number;
  type: 'LEAVE_REQUEST_UPDATE' | 'WARNING_ISSUED' | 'PENALTY_ISSUED' | 'ATTENDANCE_ALERT' | 'SYSTEM_NOTIFICATION' | 'REMINDER';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  relatedId?: number;
  relatedType?: string;
  createdAt: string;
  readAt?: string;
  employee?: {
    id: number;
    name: string;
    employeeCode: string;
  };
}

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newNotification, setNewNotification] = useState({
    employeeIds: [] as number[],
    type: 'SYSTEM_NOTIFICATION',
    title: '',
    message: '',
    priority: 'NORMAL',
  });
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadNotifications();
    loadEmployees();
  }, [priorityFilter, typeFilter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // API call would go here
      // const response = await notificationApi.getAll({
      //   priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      //   type: typeFilter !== 'all' ? typeFilter : undefined
      // });
      
      // Mock data
      const mockData: Notification[] = [
        {
          id: 1,
          employeeId: 1,
          type: 'WARNING_ISSUED',
          title: 'Warning Issued',
          message: 'You have been issued a warning for excessive break time.',
          isRead: false,
          priority: 'HIGH',
          createdAt: new Date().toISOString(),
          employee: {
            id: 1,
            name: 'John Doe',
            employeeCode: 'EMP001'
          }
        }
      ];
      setNotifications(mockData);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      // API call would go here
      // const response = await employeeApi.getAll();
      // setEmployees(response.data.data || []);
      
      // Mock data
      setEmployees([
        { id: 1, name: 'John Doe', employeeCode: 'EMP001' },
        { id: 2, name: 'Jane Smith', employeeCode: 'EMP002' }
      ]);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNotification.title || !newNotification.message || newNotification.employeeIds.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    try {
      // API call would go here
      // await notificationApi.createBulk({
      //   employeeIds: newNotification.employeeIds,
      //   type: newNotification.type,
      //   title: newNotification.title,
      //   message: newNotification.message,
      //   priority: newNotification.priority,
      // });

      toast.success(`Notification sent to ${newNotification.employeeIds.length} employee(s)`);
      setNewNotification({
        employeeIds: [],
        type: 'SYSTEM_NOTIFICATION',
        title: '',
        message: '',
        priority: 'NORMAL',
      });
      loadNotifications();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send notification');
    } finally {
      setIsCreating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'NORMAL':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOW':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'WARNING_ISSUED':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'PENALTY_ISSUED':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'LEAVE_REQUEST_UPDATE':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'ATTENDANCE_ALERT':
        return <Bell className="h-4 w-4 text-yellow-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatNotificationType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const filteredNotifications = notifications.filter(notification => {
    if (priorityFilter !== 'all' && notification.priority !== priorityFilter) return false;
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    return true;
  });

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    urgent: notifications.filter(n => n.priority === 'URGENT').length,
    high: notifications.filter(n => n.priority === 'HIGH').length,
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
            <Bell className="h-7 w-7 mr-2 text-primary" />
            Notification Management
          </h1>
          <p className="text-muted-foreground mt-1">Send and manage employee notifications</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold">{stats.unread}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Urgent</p>
                <p className="text-2xl font-bold">{stats.urgent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold">{stats.high}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Notification Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="h-5 w-5 mr-2" />
              Send Notification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateNotification} className="space-y-4">
              <div>
                <Label htmlFor="employees">Employees *</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    const employeeId = parseInt(value);
                    if (!newNotification.employeeIds.includes(employeeId)) {
                      setNewNotification({
                        ...newNotification,
                        employeeIds: [...newNotification.employeeIds, employeeId]
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employees" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name} ({employee.employeeCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {newNotification.employeeIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {newNotification.employeeIds.map((employeeId) => {
                      const employee = employees.find(e => e.id === employeeId);
                      return (
                        <span
                          key={employeeId}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center"
                        >
                          {employee?.name}
                          <button
                            type="button"
                            onClick={() => setNewNotification({
                              ...newNotification,
                              employeeIds: newNotification.employeeIds.filter(id => id !== employeeId)
                            })}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newNotification.type}
                  onValueChange={(value) => setNewNotification({ ...newNotification, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SYSTEM_NOTIFICATION">System Notification</SelectItem>
                    <SelectItem value="REMINDER">Reminder</SelectItem>
                    <SelectItem value="ATTENDANCE_ALERT">Attendance Alert</SelectItem>
                    <SelectItem value="WARNING_ISSUED">Warning Issued</SelectItem>
                    <SelectItem value="PENALTY_ISSUED">Penalty Issued</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newNotification.priority}
                  onValueChange={(value) => setNewNotification({ ...newNotification, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  placeholder="Notification title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  placeholder="Notification message"
                  rows={4}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isCreating || !newNotification.title || !newNotification.message || newNotification.employeeIds.length === 0}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {isCreating ? 'Sending...' : 'Send Notification'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
                  <SelectTrigger className="w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="SYSTEM_NOTIFICATION">System</SelectItem>
                    <SelectItem value="WARNING_ISSUED">Warning</SelectItem>
                    <SelectItem value="PENALTY_ISSUED">Penalty</SelectItem>
                    <SelectItem value="ATTENDANCE_ALERT">Attendance</SelectItem>
                    <SelectItem value="REMINDER">Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No notifications found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    No notifications found for the selected filters.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border rounded-lg p-4 ${!notification.isRead ? 'bg-blue-50 border-blue-200' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getTypeIcon(notification.type)}
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {notification.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                To: {notification.employee?.name} ({notification.employee?.employeeCode})
                              </p>
                            </div>
                            {!notification.isRead && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                Unread
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-700 mb-3">{notification.message}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>
                              {formatNotificationType(notification.type)}
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </span>
                            {notification.readAt && (
                              <>
                                <span>•</span>
                                <span>
                                  Read: {new Date(notification.readAt).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
