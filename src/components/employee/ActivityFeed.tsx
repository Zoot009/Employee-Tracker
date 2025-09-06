// src/components/employee/ActivityFeed.tsx
'use client';

import React from 'react';
import { CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ActivityItem {
  id: number;
  type: 'submission' | 'break' | 'warning' | 'issue';
  title: string;
  description: string;
  timestamp: Date;
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getIcon = (type: string, status?: string) => {
    switch (type) {
      case 'submission':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'break':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'issue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No recent activity</h3>
            <p className="mt-2 text-sm text-gray-600">
              Your recent work activities will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                    {getIcon(activity.type, activity.status)}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}