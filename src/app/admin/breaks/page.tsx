// src/app/admin/breaks/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Coffee, Clock, AlertTriangle, Users, Calendar } from 'lucide-react';
import { breakApi, employeeApi } from '@/lib/api-client';
import { Break, Employee } from '@/types';
import { formatTime, getCurrentISTDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function BreaksPage() {
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getCurrentISTDate());
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadBreaks();
  }, [selectedDate, employeeFilter]);

  const loadData = async () => {
    try {
      const employeesResponse = await employeeApi.getAll();
      if (employeesResponse.data.success) {
        setEmployees(employeesResponse.data.data || []);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employees');
    }
  };

  const loadBreaks = async () => {
    try {
      setLoading(true);
      
      const filter: any = {
        dateFrom: selectedDate,
        dateTo: selectedDate,
      };

      if (employeeFilter !== 'all') {
        filter.employeeId = parseInt(employeeFilter);
      }

      const response = await breakApi.getByDateRange(filter);
      if (response.data.success) {
        setBreaks(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading breaks:', error);
      toast.error('Failed to load breaks');
    } finally {
      setLoading(false);
    }
  };

  const handleSendWarning = async (breakRecord: Break) => {
    if (!confirm(`Send warning to ${breakRecord.employee?.name} for extended break?`)) {
      return;
    }

    try {
      await breakApi.sendWarning(breakRecord.employeeId, breakRecord.id);
      toast.success('Warning sent successfully');
      loadBreaks();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to send warning';
      toast.error(errorMessage);
    }
  };

  const getBreakDuration = (breakRecord: Break): number => {
    if (!breakRecord.breakInTime) return 0;
    
    const endTime = breakRecord.breakOutTime 
      ? new Date(breakRecord.breakOutTime) 
      : new Date();
    const startTime = new Date(breakRecord.breakInTime);
    
    return Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  };

  const getBreakStatus = (breakRecord: Break) => {
    if (breakRecord.isActive) {
      const duration = getBreakDuration(breakRecord);
      if (duration > 20) {
        return { status: 'exceeded', color: 'text-red-600', bg: 'bg-red-100' };
      }
      return { status: 'active', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    }
    return { status: 'completed', color: 'text-green-600', bg: 'bg-green-100' };
  };

  // Group breaks by employee
  const breaksByEmployee = breaks.reduce((acc, breakRecord) => {
    const employeeId = breakRecord.employeeId;
    if (!acc[employeeId]) {
      acc[employeeId] = [];
    }
    acc[employeeId].push(breakRecord);
    return acc;
  }, {} as Record<number, Break[]>);

  // Calculate stats
  const stats = {
    totalBreaks: breaks.length,
    activeBreaks: breaks.filter(b => b.isActive).length,
    exceededBreaks: breaks.filter(b => {
      const duration = getBreakDuration(b);
      return duration > 20;
    }).length,
    averageDuration: breaks.length > 0 
      ? Math.round(breaks.reduce((sum, b) => sum + getBreakDuration(b), 0) / breaks.length)
      : 0,
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Coffee className="h-7 w-7 mr-2 text-primary" />
            Break Management
          </h1>
          <p className="text-muted-foreground mt-1">Monitor employee breaks and break durations</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={getCurrentISTDate()}
                className="w-auto"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="employee">Employee</Label>
              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger className="w-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={loadBreaks} variant="outline" className="mt-6">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Coffee className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Breaks</p>
                <p className="text-2xl font-bold">{stats.totalBreaks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Breaks</p>
                <p className="text-2xl font-bold">{stats.activeBreaks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Exceeded (&gt;20min)</p>
                <p className="text-2xl font-bold">{stats.exceededBreaks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">{stats.averageDuration}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breaks List */}
      {Object.keys(breaksByEmployee).length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Coffee className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No breaks found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              No break records found for the selected date and filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(breaksByEmployee).map(([employeeId, employeeBreaks]) => {
            const employee = employees.find(emp => emp.id === parseInt(employeeId));
            
            return (
              <Card key={employeeId}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-primary">
                        {employee?.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div>{employee?.name}</div>
                      <div className="text-sm text-muted-foreground font-normal">
                        {employee?.employeeCode} • {employeeBreaks.length} breaks today
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {employeeBreaks.map((breakRecord) => {
                      const duration = getBreakDuration(breakRecord);
                      const statusInfo = getBreakStatus(breakRecord);
                      
                      return (
                        <div
                          key={breakRecord.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`h-3 w-3 rounded-full ${statusInfo.bg}`}></div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">
                                  {breakRecord.breakInTime && formatTime(breakRecord.breakInTime)}
                                </span>
                                {breakRecord.breakOutTime && (
                                  <>
                                    <span className="text-gray-500">→</span>
                                    <span className="font-medium">
                                      {formatTime(breakRecord.breakOutTime)}
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                Duration: {duration} minutes
                                {breakRecord.isActive && (
                                  <span className="ml-2 text-yellow-600">(Active)</span>
                                )}
                                {duration > 20 && (
                                  <span className="ml-2 text-red-600">(Exceeded limit)</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm px-2 py-1 rounded ${statusInfo.bg} ${statusInfo.color}`}>
                              {statusInfo.status}
                            </span>
                            {duration > 20 && !breakRecord.warningSent && (
                              <Button
                                onClick={() => handleSendWarning(breakRecord)}
                                variant="destructive"
                                size="sm"
                              >
                                Send Warning
                              </Button>
                            )}
                            {breakRecord.warningSent && (
                              <span className="text-xs text-gray-500">Warning sent</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}