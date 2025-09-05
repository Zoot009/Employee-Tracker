// src/app/admin/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Tag, FileText, AlertTriangle, BarChart3, Clock, Coffee, Settings, Calendar } from 'lucide-react';
import { employeeApi, tagApi, issueApi, logApi } from '@/lib/api-client';
import { getCurrentISTDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DashboardData {
  totalEmployees: number;
  totalTags: number;
  todaysSubmissions: number;
  pendingIssues: number;
  totalIssues: number;
  recentActivity: any[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>({
    totalEmployees: 0,
    totalTags: 0,
    todaysSubmissions: 0,
    pendingIssues: 0,
    totalIssues: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const today = getCurrentISTDate();
      
      const [employeesRes, tagsRes, issuesRes, logsRes] = await Promise.all([
        employeeApi.getAll(),
        tagApi.getAll(),
        issueApi.getAll(),
        logApi.getByDateRange({ dateFrom: today, dateTo: today }),
      ]);

      const employees = employeesRes.data.success ? employeesRes.data.data || [] : [];
      const tags = tagsRes.data.success ? tagsRes.data.data || [] : [];
      const issues = issuesRes.data.success ? issuesRes.data.data || [] : [];
      const logs = logsRes.data.success ? logsRes.data.data || [] : [];

      // Calculate today's submissions (unique employees who submitted)
      const todaysSubmissions = new Set(logs.map(log => log.employeeId)).size;
      
      // Count pending issues
      const pendingIssues = issues.filter(issue => issue.issueStatus === 'pending').length;

      setData({
        totalEmployees: employees.length,
        totalTags: tags.length,
        todaysSubmissions,
        pendingIssues,
        totalIssues: issues.length,
        recentActivity: [], // Would be populated with recent activity data
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your employee tracking system</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{data.totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Tag className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Work Tags</p>
                <p className="text-2xl font-bold">{data.totalTags}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Today's Submissions</p>
                <p className="text-2xl font-bold">{data.todaysSubmissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending Issues</p>
                <p className="text-2xl font-bold">{data.pendingIssues}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/daily-chart">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">View Daily Chart</h3>
                  <p className="text-sm text-gray-600">See today's work submissions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/employees">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Employees</h3>
                  <p className="text-sm text-gray-600">Add and edit employee records</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/assignments">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Tag Assignments</h3>
                  <p className="text-sm text-gray-600">Assign tags to employees</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/issues">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Issue Management</h3>
                  <p className="text-sm text-gray-600">Review and respond to issues</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/breaks">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Coffee className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Break Management</h3>
                  <p className="text-sm text-gray-600">Monitor employee breaks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/edit-logs">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Clock className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Edit Work Logs</h3>
                  <p className="text-sm text-gray-600">Modify submitted work entries</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Today's Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Employees</span>
              <span className="font-medium">{data.totalEmployees}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Submitted Today</span>
              <span className="font-medium text-green-600">{data.todaysSubmissions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending Submissions</span>
              <span className="font-medium text-orange-600">
                {data.totalEmployees - data.todaysSubmissions}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Submission Rate</span>
              <span className="font-medium">
                {data.totalEmployees > 0 
                  ? Math.round((data.todaysSubmissions / data.totalEmployees) * 100)
                  : 0
                }%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Issues Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Issues</span>
              <span className="font-medium">{data.totalIssues}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending Issues</span>
              <span className="font-medium text-red-600">{data.pendingIssues}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Resolution Rate</span>
              <span className="font-medium">
                {data.totalIssues > 0 
                  ? Math.round(((data.totalIssues - data.pendingIssues) / data.totalIssues) * 100)
                  : 0
                }%
              </span>
            </div>
            {data.pendingIssues > 0 && (
              <Link href="/admin/issues">
                <Button variant="outline" size="sm" className="w-full">
                  Review Pending Issues
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-blue-600">1</span>
              </div>
              <div>
                <p className="text-sm text-gray-900">
                  <Link href="/admin/employees" className="font-medium text-blue-600 hover:text-blue-500">
                    Add employees
                  </Link> to the system with their details and employee codes
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-blue-600">2</span>
              </div>
              <div>
                <p className="text-sm text-gray-900">
                  <Link href="/admin/tags" className="font-medium text-blue-600 hover:text-blue-500">
                    Create work tags
                  </Link> with time values for different tasks
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-blue-600">3</span>
              </div>
              <div>
                <p className="text-sm text-gray-900">
                  <Link href="/admin/assignments" className="font-medium text-blue-600 hover:text-blue-500">
                    Assign tags to employees
                  </Link> and set which ones are mandatory
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-blue-600">4</span>
              </div>
              <div>
                <p className="text-sm text-gray-900">
                  Employees can now log in using their codes and start tracking work time
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}