// src/components/employee/EmployeePanel.tsx - Simplified version to prevent loading issues
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Clock, Calendar, Coffee, AlertTriangle, FileText } from 'lucide-react';
import { employeeApi, assignmentApi } from '@/lib/api-client';
import { Employee, Assignment } from '@/types';
import { getCurrentISTDate, formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EmployeePanelProps {
  employee: Employee;
  onLogout: () => void;
}

export default function EmployeePanel({ employee, onLogout }: EmployeePanelProps) {
  const [selectedDate, setSelectedDate] = useState(getCurrentISTDate());
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update current date/time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Load employee data
  useEffect(() => {
    const loadData = async () => {
      if (!employee?.id) return;
      
      try {
        setLoading(true);
        setError(null);

        const assignmentsResponse = await assignmentApi.getByEmployee(employee.id);
        
        if (assignmentsResponse.data.success) {
          setAssignments(assignmentsResponse.data.data || []);
        }
      } catch (error) {
        console.error('Error loading employee data:', error);
        setError('Failed to load employee data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [employee.id]);

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 max-w-md">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
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
        {/* Date Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Calendar className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold">Select Date for Work Log</h2>
          </div>
          <div className="flex items-center space-x-4">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={getCurrentISTDate()}
              className="w-auto"
            />
          </div>
        </div>

        {/* Assignments Display */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Your Assigned Tags</h3>
          {assignments.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No Tags Assigned</h3>
              <p className="mt-2 text-sm text-gray-600">
                You don't have any work tags assigned. Please contact your administrator.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{assignment.tag?.tagName}</h4>
                    {assignment.isMandatory && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {assignment.tag?.timeMinutes} minutes per unit
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}