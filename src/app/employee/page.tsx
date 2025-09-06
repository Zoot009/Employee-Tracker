// src/app/employee/page.tsx - Enhanced Employee Dashboard
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  Clock, Calendar, Coffee, FileText, BarChart3, 
  AlertTriangle, CheckCircle, LogOut, User, Bell,
  TrendingUp, Target, Timer
} from 'lucide-react';
import { 
  employeeApi, logApi, breakApi, issueApi, warningApi 
} from '@/lib/api-client';
import { Employee, Log, Break, Issue, Warning } from '@/types';
import { getCurrentISTDate, formatDateTime, formatMinutesToHours } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [employeeCode, setEmployeeCode] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    todayLogs: [] as Log[],
    currentBreak: null as Break | null,
    recentIssues: [] as Issue[],
    activeWarnings: [] as Warning[],
    weeklyStats: {
      totalMinutes: 0,
      daysWorked: 0,
      avgPerDay: 0,
    },
  });
  const router = useRouter();

  // Update current date/time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Check if employee is already logged in
    const savedEmployee = localStorage.getItem('employee');
    if (savedEmployee) {
      try {
        const emp = JSON.parse(savedEmployee);
        setEmployee(emp);
        setIsLoggedIn(true);
        loadDashboardData(emp.id);
      } catch (error) {
        localStorage.removeItem('employee');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeCode.trim()) {
      toast.error('Please enter your employee code');
      return;
    }

    setLoggingIn(true);
    try {
      const response = await employeeApi.login(employeeCode.trim());
      if (response.data.success && response.data.data) {
        const emp = response.data.data;
        setEmployee(emp);
        setIsLoggedIn(true);
        localStorage.setItem('employee', JSON.stringify(emp));
        toast.success(`Welcome back, ${emp.name}!`);
        loadDashboardData(emp.id);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      toast.error(errorMessage);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setEmployee(null);
    setIsLoggedIn(false);
    setEmployeeCode('');
    setDashboardData({
      todayLogs: [],
      currentBreak: null,
      recentIssues: [],
      activeWarnings: [],
      weeklyStats: { totalMinutes: 0, daysWorked: 0, avgPerDay: 0 },
    });
    localStorage.removeItem('employee');
    toast.success('Logged out successfully');
  };

  const loadDashboardData = async (employeeId: number) => {
    try {
      setLoading(true);
      const today = getCurrentISTDate();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoString = weekAgo.toISOString().split('T')[0];

      // Load all dashboard data
      const [
        todayLogsResponse,
        breakStatusResponse,
        issuesResponse,
        warningsResponse,
        weeklyLogsResponse,
      ] = await Promise.all([
        logApi.getByDate(employeeId, today),
        breakApi.getStatus(employeeId),
        issueApi.getByEmployee(employeeId),
        warningApi.getByEmployee(employeeId),
        logApi.getByDateRange({
          employeeId,
          dateFrom: weekAgoString,
          dateTo: today,
        }),
      ]);

      const weeklyLogs = weeklyLogsResponse.data.success ? weeklyLogsResponse.data.data || [] : [];
      const weeklyTotalMinutes = weeklyLogs.reduce((sum, log) => sum + log.totalMinutes, 0);
      const uniqueDays = new Set(weeklyLogs.map(log => new Date(log.logDate).toDateString())).size;

      setDashboardData({
        todayLogs: todayLogsResponse.data.success ? todayLogsResponse.data.data || [] : [],
        currentBreak: breakStatusResponse.data.success ? breakStatusResponse.data.data : null,
        recentIssues: issuesResponse.data.success ? 
          (issuesResponse.data.data || []).slice(0, 3) : [],
        activeWarnings: warningsResponse.data.success ? 
          (warningsResponse.data.data || []).filter(w => w.isActive) : [],
        weeklyStats: {
          totalMinutes: weeklyTotalMinutes,
          daysWorked: uniqueDays,
          avgPerDay: uniqueDays > 0 ? Math.round(weeklyTotalMinutes / uniqueDays) : 0,
        },
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate today's stats
  const todayStats = {
    totalMinutes: dashboardData.todayLogs.reduce((sum, log) => sum + log.totalMinutes, 0),
    totalTags: dashboardData.todayLogs.length,
    hasSubmitted: dashboardData.todayLogs.length > 0,
    pendingIssues: dashboardData.recentIssues.filter(issue => issue.issueStatus === 'pending').length,
  };

  // Login form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Employee Portal</CardTitle>
            <p className="text-gray-600">Enter your employee code to access your dashboard</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="employeeCode">Employee Code</Label>
                <Input
                  id="employeeCode"
                  type="text"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  placeholder="Enter your employee code"
                  required
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                disabled={loggingIn || !employeeCode.trim()}
                className="w-full"
                size="lg"
              >
                {loggingIn ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
                Welcome back, {employee?.name}!
              </h1>
              <p className="text-sm text-gray-600">
                Employee Code: {employee?.employeeCode} • {formatDateTime(currentDateTime)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {dashboardData.activeWarnings.length > 0 && (
                <div className="flex items-center text-red-600">
                  <Bell className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium">{dashboardData.activeWarnings.length} warning(s)</span>
                </div>
              )}
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Warnings */}
        {dashboardData.activeWarnings.length > 0 && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Active Warnings</h3>
                  <div className="mt-2 space-y-1">
                    {dashboardData.activeWarnings.map((warning) => (
                      <p key={warning.id} className="text-sm text-yellow-700">
                        • {warning.warningMessage} ({new Date(warning.warningDate).toLocaleDateString()})
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Today's Status</p>
                  <p className="text-lg font-bold">
                    {todayStats.hasSubmitted ? 'Submitted' : 'Pending'}
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
                  <p className="text-sm font-medium text-muted-foreground">Today's Time</p>
                  <p className="text-lg font-bold">{formatMinutesToHours(todayStats.totalMinutes)}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Break Status</p>
                  <p className="text-lg font-bold">
                    {dashboardData.currentBreak?.isActive ? 'On Break' : 'Working'}
                  </p>
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
                  <p className="text-lg font-bold">{todayStats.pendingIssues}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="hover:shadow-lg transition-all cursor-pointer transform hover:scale-105" 
            onClick={() => router.push('/employee/work-log')}
          >
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Work Log</h3>
              <p className="text-sm text-gray-600">Submit your daily work entries</p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-all cursor-pointer transform hover:scale-105" 
            onClick={() => router.push('/employee/breaks')}
          >
            <CardContent className="p-6 text-center">
              <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Coffee className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Break Tracker</h3>
              <p className="text-sm text-gray-600">Manage your break time</p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-all cursor-pointer transform hover:scale-105" 
            onClick={() => router.push('/employee/issues')}
          >
            <CardContent className="p-6 text-center">
              <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Report Issues</h3>
              <p className="text-sm text-gray-600">Submit workplace issues</p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-all cursor-pointer transform hover:scale-105" 
            onClick={() => router.push('/employee/performance')}
          >
            <CardContent className="p-6 text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Performance</h3>
              <p className="text-sm text-gray-600">View your analytics</p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Weekly Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Work Time</span>
                <span className="font-medium">{formatMinutesToHours(dashboardData.weeklyStats.totalMinutes)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Days Worked</span>
                <span className="font-medium text-green-600">{dashboardData.weeklyStats.daysWorked}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Per Day</span>
                <span className="font-medium">{formatMinutesToHours(dashboardData.weeklyStats.avgPerDay)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Progress to Target</span>
                <span className="font-medium">
                  {Math.round((dashboardData.weeklyStats.totalMinutes / (7 * 8 * 60)) * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Timer className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Today's submission status */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      todayStats.hasSubmitted ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      {todayStats.hasSubmitted ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      {todayStats.hasSubmitted 
                        ? 'Work log submitted for today' 
                        : 'Work log pending for today'
                      }
                    </p>
                    <p className="text-xs text-gray-500">{formatDateTime(new Date())}</p>
                  </div>
                </div>

                {/* Current break status */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      dashboardData.currentBreak?.isActive ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      <Coffee className={`h-4 w-4 ${
                        dashboardData.currentBreak?.isActive ? 'text-yellow-600' : 'text-gray-600'
                      }`} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      {dashboardData.currentBreak?.isActive 
                        ? 'Currently on break' 
                        : 'Not on break'
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      {dashboardData.currentBreak?.isActive && dashboardData.currentBreak.breakInTime
                        ? `Started at ${formatDateTime(dashboardData.currentBreak.breakInTime)}`
                        : 'Ready to work'
                      }
                    </p>
                  </div>
                </div>

                {/* Recent issues */}
                {dashboardData.recentIssues.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Issues</h4>
                    {dashboardData.recentIssues.map((issue) => (
                      <div key={issue.id} className="flex items-start space-x-3 mb-2">
                        <div className="flex-shrink-0">
                          <div className="h-6 w-6 bg-red-100 rounded-full flex items-center justify-center">
                            <FileText className="h-3 w-3 text-red-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-900">{issue.issueCategory}</p>
                          <p className="text-xs text-gray-500">
                            {issue.issueStatus} • {new Date(issue.raisedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        {!todayStats.hasSubmitted && (
          <Card className="mt-8 border-blue-200 bg-blue-50">
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Ready to log your work for today?
              </h3>
              <p className="text-blue-700 mb-4">
                Submit your daily work log to track your productivity and maintain your records.
              </p>
              <Button 
                onClick={() => router.push('/employee/work-log')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Submit Today's Work Log
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}