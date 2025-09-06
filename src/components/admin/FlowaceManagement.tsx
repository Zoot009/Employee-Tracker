// src/components/admin/FlowaceManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Activity, Upload, Clock, Monitor, Mouse, Keyboard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { processFlowaceCSV, generateFlowaceTemplate } from '@/lib/csv-processor';
import { getCurrentISTDate } from '@/lib/utils';

interface FlowaceRecord {
  id: number;
  employeeId: number;
  date: string;
  startTime: string;
  endTime?: string;
  totalMinutes: number;
  activeMinutes: number;
  idleMinutes: number;
  applications?: any[];
  websites?: any[];
  screenshots: number;
  keystrokes: number;
  mouseClicks: number;
  employee?: {
    name: string;
    employeeCode: string;
  };
}

export default function FlowaceManagement() {
  const [flowaceRecords, setFlowaceRecords] = useState<FlowaceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getCurrentISTDate());
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    loadFlowaceData();
  }, [selectedDate]);

  const loadFlowaceData = async () => {
    try {
      setLoading(true);
      // API call would go here
      // const response = await flowaceApi.getByDate(selectedDate);
      
      // Mock data
      const mockData: FlowaceRecord[] = [
        {
          id: 1,
          employeeId: 1,
          date: selectedDate,
          startTime: '09:00:00',
          endTime: '18:00:00',
          totalMinutes: 480,
          activeMinutes: 420,
          idleMinutes: 60,
          applications: ['Chrome', 'VS Code', 'Slack'],
          websites: ['github.com', 'stackoverflow.com'],
          screenshots: 120,
          keystrokes: 5240,
          mouseClicks: 1250,
          employee: {
            name: 'John Doe',
            employeeCode: 'EMP001'
          }
        }
      ];
      setFlowaceRecords(mockData);
    } catch (error) {
      toast.error('Failed to load Flowace data');
    } finally {
      setLoading(false);
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
      const result = await processFlowaceCSV(file);
      
      if (result.success) {
        toast.success(`Processed ${result.processedRecords}/${result.totalRecords} records successfully`);
        loadFlowaceData();
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
    const template = generateFlowaceTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flowace-template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateProductivity = (record: FlowaceRecord) => {
    if (record.totalMinutes === 0) return 0;
    return Math.round((record.activeMinutes / record.totalMinutes) * 100);
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
            <Activity className="h-7 w-7 mr-2 text-primary" />
            Flowace Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage Flowace time tracking data</p>
        </div>
        <Button onClick={downloadTemplate} variant="outline">
          Download Template
        </Button>
      </div>

      {/* File Upload */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Import Flowace Data
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
        </CardContent>
      </Card>

      {/* Date Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
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
        </CardContent>
      </Card>

      {/* Flowace Records */}
      <Card>
        <CardHeader>
          <CardTitle>
            Flowace Records - {new Date(selectedDate).toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {flowaceRecords.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No Flowace data found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No Flowace records found for the selected date.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {flowaceRecords.map((record) => (
                <div key={record.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-primary">
                          {record.employee?.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{record.employee?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {record.employee?.employeeCode}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {calculateProductivity(record)}% Productive
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {record.startTime} - {record.endTime || 'Active'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <Clock className="h-6 w-6 text-blue-500" />
                          <div className="ml-3">
                            <p className="text-sm text-muted-foreground">Total Time</p>
                            <p className="font-semibold">{Math.round(record.totalMinutes / 60)}h {record.totalMinutes % 60}m</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <Monitor className="h-6 w-6 text-green-500" />
                          <div className="ml-3">
                            <p className="text-sm text-muted-foreground">Active Time</p>
                            <p className="font-semibold">{Math.round(record.activeMinutes / 60)}h {record.activeMinutes % 60}m</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <Keyboard className="h-6 w-6 text-purple-500" />
                          <div className="ml-3">
                            <p className="text-sm text-muted-foreground">Keystrokes</p>
                            <p className="font-semibold">{record.keystrokes.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <Mouse className="h-6 w-6 text-orange-500" />
                          <div className="ml-3">
                            <p className="text-sm text-muted-foreground">Mouse Clicks</p>
                            <p className="font-semibold">{record.mouseClicks.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Applications Used</h4>
                      <div className="bg-gray-50 rounded-lg p-3">
                        {record.applications && record.applications.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {record.applications.map((app, index) => (
                              <span
                                key={index}
                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                              >
                                {app}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No applications data</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Websites Visited</h4>
                      <div className="bg-gray-50 rounded-lg p-3">
                        {record.websites && record.websites.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {record.websites.map((website, index) => (
                              <span
                                key={index}
                                className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                              >
                                {website}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No websites data</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}