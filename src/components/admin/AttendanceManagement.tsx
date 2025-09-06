
// src/components/admin/AttendanceManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Upload, Users, AlertTriangle, CheckCircle, FileX, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { analyzeAttendance, getStatusMessage, getAttendanceColor } from '@/lib/attendance-logic';
import { processAttendanceCSV, generateAttendanceTemplate } from '@/lib/csv-processor';
import { getCurrentISTDate } from '@/lib/utils';

interface AttendanceRecord {
  id: number;
  employeeId: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE_APPROVED' | 'WFH_APPROVED' | 'LATE' | 'HALF_DAY';
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  hasTagWork: boolean;
  hasFlowaceWork: boolean;
  tagWorkMinutes: number;
  flowaceMinutes: number;
  hasException: boolean;
  exceptionType?: string;
  exceptionNotes?: string;
  importSource: string;
  employee?: {
    id: number;
    name: string;
    employeeCode: string;
  };
  leaveRequest?: {
    id: number;
    type: string;
    status: string;
  };
}

export default function AttendanceManagement() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getCurrentISTDate());
  const [statusFilter, setStatusFilter] = useState<'all' | 'exceptions' | 'present' | 'absent'>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [employees, setEmployees] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    loadAttendanceData();
    loadEmployees();
  }, [selectedDate, statusFilter, employeeFilter]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      // API call would go here
      // const response = await attendanceApi.getByDate({
      //   date: selectedDate,
      //   status: statusFilter !== 'all' ? statusFilter : undefined,
      //   employeeId: employeeFilter !== 'all' ? parseInt(employeeFilter) : undefined
      // });
      
      // Mock data for now
      const mockData: AttendanceRecord[] = [
        {
          id: 1,
          employeeId: 1,
          date: selectedDate,
          status: 'PRESENT',
          checkInTime: '09:00:00',
          checkOutTime: '18:00:00',
          totalHours: 8.5,
          hasTagWork: true,
          hasFlowaceWork: true,
          tagWorkMinutes: 480,
          flowaceMinutes: 450,
          hasException: false,
          importSource: 'csv',
          employee: {
            id: 1,
            name: 'John Doe',
            employeeCode: 'EMP001'
          }
        }
      ];
      setAttendanceRecords(mockData);
    } catch (error) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      // API call would go here
      // const response = await employeeApi.getAll();
      // setEmployees(response.data.data || []);
      
      // Mock data
      setEmployees([
        { id: 1, name: 'John Doe', employeeCode: 'EMP001' },
        { id: 2, name: 'Jane Smith', employeeCode: 'EMP002' }
      ]);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    try {
      setUploadProgress(0);
      const result = await processAttendanceCSV(file);
      
      if (result.success) {
        toast.success(`Processed ${result.processedRecords}/${result.totalRecords} records successfully`);
        loadAttendanceData();
      } else {
        toast.error(`Failed to process CSV: ${result.errors.length} errors`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to process CSV file');
    } finally {
      setUploadProgress(null);
      event.target.value = '';
    }
  };

  const downloadTemplate = () => {
    const template = generateAttendanceTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'attendance-template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportAttendance = () => {
    // Generate CSV export of current data
    const headers = [
      'Employee Code',
      'Employee Name',
      'Date',
      'Status',
      'Check In',
      'Check Out',
      'Total Hours',
      'Tag Work Minutes',
      'Flowace Minutes',
      'Has Exception',
      'Exception Type'
    ];

    const csvData = attendanceRecords.map(record => [
      record.employee?.employeeCode || '',
      record.employee?.name || '',
      record.date,
      record.status,
      record.checkInTime || '',
      record.checkOutTime || '',
      record.totalHours || '',
      record.tagWorkMinutes,
      record.flowaceMinutes,
      record.hasException ? 'Yes' : 'No',
      record.exceptionType || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${selectedDate}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredRecords = attendanceRecords.filter(record => {
    if (statusFilter === 'exceptions' && !record.hasException) return false;
    if (statusFilter === 'present' && !['PRESENT', 'WFH_APPROVED'].includes(record.status)) return false;
    if (statusFilter === 'absent' && record.status !== 'ABSENT') return false;
    return true;
  });

  const stats = {
    total: attendanceRecords.length,
    present: attendanceRecords.filter(r => ['PRESENT', 'WFH_APPROVED', 'LEAVE_APPROVED'].includes(r.status)).length,
    absent: attendanceRecords.filter(r => r.status === 'ABSENT').length,
    exceptions: attendanceRecords.filter(r => r.hasException).length,
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
            <Users className="h-7 w-7 mr-2 text-primary" />
            Attendance Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage employee attendance and work evidence</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={downloadTemplate} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Template
          </Button>
          <Button onClick={exportAttendance} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* File Upload */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Import Attendance Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={uploadProgress !== null}
            />
            {uploadProgress !== null && (
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Upload CSV file with attendance data. Download template for correct format.
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
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
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Records</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="exceptions">Exceptions Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="employee">Employee</Label>
              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger>
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
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Present</p>
                <p className="text-2xl font-bold">{stats.present}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileX className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold">{stats.absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Exceptions</p>
                <p className="text-2xl font-bold">{stats.exceptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>
            Attendance Records - {new Date(selectedDate).toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No records found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No attendance records found for the selected filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Employee</th>
                    <th className="text-center px-4 py-3 font-medium">Status</th>
                    <th className="text-center px-4 py-3 font-medium">Check In/Out</th>
                    <th className="text-center px-4 py-3 font-medium">Work Evidence</th>
                    <th className="text-center px-4 py-3 font-medium">Exceptions</th>
                    <th className="text-center px-4 py-3 font-medium">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-muted/25">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-primary">
                              {record.employee?.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{record.employee?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {record.employee?.employeeCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: getAttendanceColor(record.status, record.hasException) + '20',
                            color: getAttendanceColor(record.status, record.hasException)
                          }}
                        >
                          {record.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {record.checkInTime && record.checkOutTime ? (
                          <div>
                            <div>{record.checkInTime} - {record.checkOutTime}</div>
                            <div className="text-muted-foreground">
                              {record.totalHours}h
                            </div>
                          </div>
                        ) : record.checkInTime ? (
                          <div>
                            <div>{record.checkInTime} - ?</div>
                            <div className="text-red-500 text-xs">No checkout</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No data</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center justify-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${record.hasTagWork ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span>Tags: {record.tagWorkMinutes}m</span>
                          </div>
                          <div className="flex items-center justify-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${record.hasFlowaceWork ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
                            <span>Flowace: {record.flowaceMinutes}m</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {record.hasException ? (
                          <div>
                            <AlertTriangle className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                            <div className="text-xs text-orange-600">
                              {record.exceptionType?.replace('_', ' ')}
                            </div>
                          </div>
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {record.importSource}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}