'use client';

import React, { useState, useEffect } from 'react';
import { Coffee, Clock, AlertTriangle } from 'lucide-react';
import { Break } from '@/types';
import { formatTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface BreakTrackerProps {
  employeeId: number;
  currentBreak: Break | null;
  onBreakIn: () => void;
  onBreakOut: () => void;
}

export default function BreakTracker({
  employeeId,
  currentBreak,
  onBreakIn,
  onBreakOut,
}: BreakTrackerProps) {
  const [breakDuration, setBreakDuration] = useState(0);

  useEffect(() => {
    if (currentBreak?.isActive && currentBreak.breakInTime) {
      const timer = setInterval(() => {
        const now = new Date();
        const breakStart = new Date(currentBreak.breakInTime!);
        const diffInMinutes = Math.floor((now.getTime() - breakStart.getTime()) / (1000 * 60));
        setBreakDuration(diffInMinutes);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentBreak]);

  const isExceeded = breakDuration > 20;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Coffee className="h-5 w-5 text-blue-500" />
        <h2 className="text-lg font-semibold">Break Management</h2>
      </div>

      <div className="space-y-4">
        {/* Break Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {currentBreak?.isActive ? (
              <>
                <Button onClick={onBreakOut}  size="sm">
                  Break Out
                </Button>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className={`text-sm font-medium ${isExceeded ? 'text-red-600' : 'text-gray-900'}`}>
                    On break for: {breakDuration} minutes
                    {isExceeded && (
                      <span className="ml-2 text-red-600">
                        <AlertTriangle className="inline h-4 w-4" /> Exceeded 20 minutes!
                      </span>
                    )}
                  </span>
                </div>
              </>
            ) : (
              <Button onClick={onBreakIn} size="sm">
                Break In
              </Button>
            )}
          </div>
        </div>

        {/* Today's Break History */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Today's Breaks</h3>
          {/* This would be populated with today's break data */}
          <div className="text-sm text-gray-500">
            Break history will be displayed here
          </div>
        </div>
      </div>
    </div>
  );
}