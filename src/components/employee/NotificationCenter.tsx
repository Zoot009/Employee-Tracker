// src/components/employee/NotificationCenter.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, MessageSquare, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: string;
  createdAt: string;
  readAt?: string;
}

interface NotificationCenterProps {
  employeeId: number;
}

export function NotificationCenter({ employeeId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [employeeId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // API call would go here
      // const response = await notificationApi.getByEmployee(employeeId);
      
      // Mock data
      const mockData: Notification[] = [
        {
          id: 1,
          type: 'WARNING_ISSUED',
          title: 'Warning Issued',
          message: 'You have been issued a warning for excessive break time.',
          isRead: false,
          priority: 'HIGH',
          createdAt: new Date().toISOString(),
        }
      ];
      setNotifications(mockData);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      // API call would go here
      // await notificationApi.markAsRead(notificationId);
      
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'WARNING_ISSUED':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'PENALTY_ISSUED':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'LEAVE_REQUEST_UPDATE':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'border-l-red-500';
      case 'HIGH':
        return 'border-l-orange-500';
      case 'NORMAL':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notifications
          </div>
          {unreadCount > 0 && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No notifications</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You're all caught up! Check back later for updates.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border-l-4 rounded-lg p-4 ${getPriorityColor(notification.priority)} ${
                  !notification.isRead ? 'bg-blue-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <h4 className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <Button
                      onClick={() => markAsRead(notification.id)}
                      variant="outline"
                      size="sm"
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}   