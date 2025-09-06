
// src/components/forms/DateRangePicker.tsx
'use client';

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentISTDate } from '@/lib/utils';

interface DateRangePickerProps {
  dateFrom: string;
  dateTo: string;
  onDateChange: (dateFrom: string, dateTo: string) => void;
  maxDate?: string;
  minDate?: string;
  title?: string;
}

export function DateRangePicker({
  dateFrom,
  dateTo,
  onDateChange,
  maxDate = getCurrentISTDate(),
  minDate,
  title = 'Date Range'
}: DateRangePickerProps) {
  const [localDateFrom, setLocalDateFrom] = useState(dateFrom);
  const [localDateTo, setLocalDateTo] = useState(dateTo);

  const handleApply = () => {
    if (localDateFrom && localDateTo) {
      onDateChange(localDateFrom, localDateTo);
    }
  };

  const setPreset = (days: number) => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);
    
    const from = startDate.toISOString().split('T')[0];
    const to = today.toISOString().split('T')[0];
    
    setLocalDateFrom(from);
    setLocalDateTo(to);
    onDateChange(from, to);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dateFrom">From Date</Label>
            <Input
              id="dateFrom"
              type="date"
              value={localDateFrom}
              onChange={(e) => setLocalDateFrom(e.target.value)}
              max={localDateTo || maxDate}
              min={minDate}
            />
          </div>
          <div>
            <Label htmlFor="dateTo">To Date</Label>
            <Input
              id="dateTo"
              type="date"
              value={localDateTo}
              onChange={(e) => setLocalDateTo(e.target.value)}
              min={localDateFrom || minDate}
              max={maxDate}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPreset(7)}
          >
            Last 7 Days
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPreset(30)}
          >
            Last 30 Days
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPreset(90)}
          >
            Last 3 Months
          </Button>
        </div>

        <Button
          onClick={handleApply}
          disabled={!localDateFrom || !localDateTo}
          className="w-full"
        >
          Apply Date Range
        </Button>
      </CardContent>
    </Card>
  );
}