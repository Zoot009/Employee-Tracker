// src/components/employee/WeeklySummary.tsx
'use client';

import React from 'react';
import { TrendingUp, Calendar, Clock } from 'lucide-react';
import { formatMinutesToHours } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeeklySummaryProps {
  totalMinutes: number;
  daysWorked: number;
  avgPerDay: number;
  targetMinutes?: number;
}

export function WeeklySummary({
  totalMinutes,
  daysWorked,
  avgPerDay,
  targetMinutes = 2400 // 40 hours per week
}: WeeklySummaryProps) {
  const progressPercentage = Math.min((totalMinutes / targetMinutes) * 100, 100);

  return (
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
          <span className="font-medium">{formatMinutesToHours(totalMinutes)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Days Worked</span>
          <span className="font-medium text-green-600">{daysWorked}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Average Per Day</span>
          <span className="font-medium">{formatMinutesToHours(avgPerDay)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Progress to Target</span>
          <span className="font-medium">
            {Math.round(progressPercentage)}%
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
