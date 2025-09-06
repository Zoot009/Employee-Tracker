// src/components/employee/DashboardStats.tsx
'use client';

import React from 'react';
import { Clock, Calendar, Target, TrendingUp } from 'lucide-react';
import { formatMinutesToHours } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardStatsProps {
  todayMinutes: number;
  weeklyMinutes: number;
  weeklyDays: number;
  completionRate: number;
}

export function DashboardStats({
  todayMinutes,
  weeklyMinutes,
  weeklyDays,
  completionRate
}: DashboardStatsProps) {
  const avgPerDay = weeklyDays > 0 ? Math.round(weeklyMinutes / weeklyDays) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Today's Work</p>
              <p className="text-2xl font-bold">{formatMinutesToHours(todayMinutes)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold">{formatMinutesToHours(weeklyMinutes)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Avg Per Day</p>
              <p className="text-2xl font-bold">{formatMinutesToHours(avgPerDay)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Completion</p>
              <p className="text-2xl font-bold">{completionRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}