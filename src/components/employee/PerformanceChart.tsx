// src/components/employee/PerformanceChart.tsx
'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { formatMinutesToHours } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DailyData {
  date: string;
  minutes: number;
}

interface PerformanceChartProps {
  data: DailyData[];
  title?: string;
}

export function PerformanceChart({ data, title = "Daily Performance" }: PerformanceChartProps) {
  const maxMinutes = Math.max(...data.map(d => d.minutes), 480); // At least 8 hours scale

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">No data available</p>
            </div>
          ) : (
            data.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-20 text-sm text-gray-600">
                  {new Date(item.date).toLocaleDateString('en-IN', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      {formatMinutesToHours(item.minutes)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(item.minutes / maxMinutes) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}