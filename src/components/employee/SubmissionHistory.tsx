// src/components/employee/SubmissionHistory.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatMinutesToHours } from '@/lib/utils';

interface SubmissionHistoryProps {
  employeeId: number;
}

interface SubmissionRecord {
  date: string;
  totalMinutes: number;
  status: 'submitted' | 'pending' | 'warning';
  submissionTime?: string;
}

export default function SubmissionHistory({ employeeId }: SubmissionHistoryProps) {
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissionHistory();
  }, [employeeId]);

  const loadSubmissionHistory = async () => {
    try {
      // This would be implemented with an actual API call
      // For now, using mock data
      const mockData: SubmissionRecord[] = [
        {
          date: '2024-01-15',
          totalMinutes: 480,
          status: 'submitted',
          submissionTime: '18:30',
        },
        {
          date: '2024-01-14',
          totalMinutes: 420,
          status: 'warning',
          submissionTime: '17:45',
        },
        {
          date: '2024-01-13',
          totalMinutes: 0,
          status: 'pending',
        },
      ];
      
      setSubmissions(mockData);
    } catch (error) {
      console.error('Error loading submission history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold">Submission History</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold">Recent Submissions</h3>
      </div>
      
      {submissions.length > 0 ? (
        <div className="space-y-3">
          {submissions.map((submission, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">
                  {new Date(submission.date).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-sm text-gray-600">
                  {submission.totalMinutes > 0 
                    ? formatMinutesToHours(submission.totalMinutes)
                    : 'No data'
                  }
                  {submission.submissionTime && (
                    <span className="text-xs text-gray-500 ml-2">
                      at {submission.submissionTime}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                {submission.status === 'submitted' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {submission.status === 'warning' && (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
                {submission.status === 'pending' && (
                  <Clock className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Calendar className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">No submission history yet</p>
        </div>
      )}
    </div>
  );
}