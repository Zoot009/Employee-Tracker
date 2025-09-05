// src/app/employee/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Calendar, Coffee, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { getCurrentISTDate, formatDateTime } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EmployeeDashboard() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const router = useRouter();

  // Update current date/time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // For now, using mock data - in real implementation, this would come from API
  const mockData = {
    employee: {
      name: 'John Doe',
      employeeCode: 'EMP001',
    },
    todayStats: {
      workLogged: true,
      totalMinutes: 480,
      breaksTaken: 2,
      onBreak: false,
      openIssues: 1,
    },
    recentActivity: [
      { type: 'work_log', message: 'Submitted work log for today', time: '09:30 AM' },
      { type: 'break', message: 'Took a 15-minute break', time: '11:00 AM' },
      { type: 'issue', message: 'Reported equipment issue', time: '02:30 PM' },
    ],
  };

  return (
    <div className="p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {mockData.employee.name}!
            </h1>
            <p className="text-gray-600 mt-2">
              Employee Code: {mockData.employee.employeeCode}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-medium text-gray-900">
              {formatDateTime(currentDateTime)}
            </p>
            <p className="text-sm text-gray-500">IST</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Today's Work Log</p>
                <p className="text-lg font-bold">
                  {mockData.todayStats.workLogged ? 'Submitted' : 'Pending'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Time Logged</p>
                <p className="text-lg font-bold">{Math.floor(mockData.todayStats.totalMinutes / 60)}h {mockData.todayStats.totalMinutes % 60}m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Coffee className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Breaks Today</p>
                <p className="text-lg font-bold">{mockData.todayStats.breaksTaken}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Open Issues</p>
                <p className="text-lg font-bold">{mockData.todayStats.openIssues}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/employee/work-log')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Log Work Time</h3>
                <p className="text-sm text-gray-600">Submit your daily work entries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/employee/breaks')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Coffee className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Breaks</h3>
                <p className="text-sm text-gray-600">Track your break time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/employee/issues')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Report Issues</h3>
                <p className="text-sm text-gray-600">Submit workplace issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {activity.type === 'work_log' && (
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                  {activity.type === 'break' && (
                    <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Coffee className="h-4 w-4 text-yellow-600" />
                    </div>
                  )}
                  {activity.type === 'issue' && (
                    <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Work Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Break Status</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                mockData.todayStats.onBreak 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {mockData.todayStats.onBreak ? 'On Break' : 'Working'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Today's Submission</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                mockData.todayStats.workLogged
                  ? 'bg-green-100 text-green-800'
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {mockData.todayStats.workLogged ? 'Complete' : 'Pending'}
              </span>
            </div>
            
            {!mockData.todayStats.workLogged && (
              <div className="mt-4">
                <Button 
                  onClick={() => router.push('/employee/work-log')}
                  className="w-full"
                >
                  Submit Today's Work Log
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}