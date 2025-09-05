'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Tag, FileText, AlertTriangle, BarChart3, Clock, Coffee, Settings } from 'lucide-react';
import { DashboardStats } from '@/types';
import { dashboardApi } from '@/lib/api-client';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  href?: string;
}

function StatCard({ title, value, icon: Icon, color, href }: StatCardProps) {
  const content = (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // For now, we'll use mock data since the API endpoint needs to be implemented
      setStats({
        totalEmployees: 0,
        totalTags: 0,
        todaysSubmissions: 0,
        pendingIssues: 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
         
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Employees"
          value={stats?.totalEmployees || 0}
          icon={Users}
          color="bg-blue-500"
          href="/admin/employees"
        />
        <StatCard
          title="Total Tags"
          value={stats?.totalTags || 0}
          icon={Tag}
          color="bg-green-500"
          href="/admin/tags"
        />
        <StatCard
          title="Today's Submissions"
          value={stats?.todaysSubmissions || 0}
          icon={FileText}
          color="bg-purple-500"
          href="/admin/daily-chart"
        />
        <StatCard
          title="Pending Issues"
          value={stats?.pendingIssues || 0}
          icon={AlertTriangle}
          color="bg-red-500"
          href="/admin/issues"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link
          href="/admin/daily-chart"
          className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Daily Chart</h3>
              <p className="text-sm text-gray-600">See today's work submissions</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/employees"
          className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Employees</h3>
              <p className="text-sm text-gray-600">Add and edit employee records</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/assignments"
          className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Tag Assignments</h3>
              <p className="text-sm text-gray-600">Assign tags to employees</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/missing-data"
          className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Missing Data Report</h3>
              <p className="text-sm text-gray-600">Check for incomplete submissions</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/breaks"
          className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Coffee className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Break Management</h3>
              <p className="text-sm text-gray-600">Monitor employee breaks</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/edit-logs"
          className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Edit Work Logs</h3>
              <p className="text-sm text-gray-600">Modify submitted work entries</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
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
      </div>
    </div>
  );
}