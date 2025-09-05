'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { logApi } from '@/lib/api-client';
import { Assignment } from '@/types';
import { formatMinutesToHours } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface WorkLogFormProps {
  employeeId: number;
  selectedDate: string;
  assignments: Assignment[];
  onSubmitSuccess: () => void;
}

interface LogEntry {
  tagId: number;
  count: number;
}

export default function WorkLogForm({
  employeeId,
  selectedDate,
  assignments,
  onSubmitSuccess,
}: WorkLogFormProps) {
  const [logs, setLogs] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalMinutes, setTotalMinutes] = useState(0);

  // Initialize logs state when assignments change
  useEffect(() => {
    const initialLogs: Record<number, number> = {};
    assignments.forEach(assignment => {
      initialLogs[assignment.tagId] = 0;
    });
    setLogs(initialLogs);
    loadExistingData();
  }, [assignments, employeeId, selectedDate]);

  // Calculate total minutes when logs change
  useEffect(() => {
    let total = 0;
    assignments.forEach(assignment => {
      const count = logs[assignment.tagId] || 0;
      const minutes = count * (assignment.tag?.timeMinutes || 0);
      total += minutes;
    });
    setTotalMinutes(total);
  }, [logs, assignments]);

  const loadExistingData = async () => {
    try {
      const response = await logApi.getByDate(employeeId, selectedDate);
      if (response.data.success && response.data.data) {
        const existingLogs: Record<number, number> = {};
        response.data.data.forEach(log => {
          existingLogs[log.tagId] = log.count;
        });
        setLogs(existingLogs);
      }
    } catch (error) {
      console.error('Error loading existing data:', error);
    }
  };

  const handleCountChange = (tagId: number, count: number) => {
    setLogs(prev => ({
      ...prev,
      [tagId]: Math.max(0, count),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!confirm('Once submitted, this data will be locked and cannot be edited. Continue?')) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const logEntries: LogEntry[] = Object.entries(logs).map(([tagId, count]) => ({
        tagId: parseInt(tagId),
        count,
      }));

      // Check for missing mandatory tags
      const missingMandatory = assignments.some(assignment => 
        assignment.isMandatory && (logs[assignment.tagId] || 0) === 0
      );

      if (missingMandatory) {
        if (!confirm('Warning: You have missed some mandatory tags. Continue anyway?')) {
          setIsSubmitting(false);
          return;
        }
      }

      const response = await logApi.submit({
        employeeId,
        logs: logEntries,
        logDate: selectedDate,
      });

      if (response.data.success) {
        toast.success('Work log submitted successfully!');
        onSubmitSuccess();
      } else {
        toast.error(response.data.error || 'Failed to submit work log');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to submit work log';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTagTotal = (tagId: number, timeMinutes: number): number => {
    const count = logs[tagId] || 0;
    return count * timeMinutes;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Work Log - {new Date(selectedDate).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time/Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.map((assignment) => {
                const count = logs[assignment.tagId] || 0;
                const timeMinutes = assignment.tag?.timeMinutes || 0;
                const totalMinutes = calculateTagTotal(assignment.tagId, timeMinutes);
                
                return (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {assignment.tag?.tagName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.isMandatory ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Mandatory
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Optional
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {timeMinutes} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Input
                        type="number"
                        min="0"
                        value={count}
                        onChange={(e) => handleCountChange(assignment.tagId, parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {totalMinutes} min
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={4} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                  Total Time:
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                  {formatMinutesToHours(totalMinutes)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-6 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Important Notice
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Once submitted, this data will be locked and cannot be edited. Please review your entries carefully before submitting.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Submit & Lock Work Log</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}