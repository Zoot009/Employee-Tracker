// src/components/employee/LeaveRequestForm.tsx
'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface LeaveRequestFormProps {
  employeeId: number;
  onSubmitSuccess: () => void;
}

export function LeaveRequestForm({ employeeId, onSubmitSuccess }: LeaveRequestFormProps) {
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    isUrgent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.leaveType || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    setIsSubmitting(true);
    try {
      // API call would go here
      // await leaveApi.create({
      //   employeeId,
      //   leaveType: formData.leaveType,
      //   startDate: formData.startDate,
      //   endDate: formData.endDate,
      //   reason: formData.reason.trim() || undefined,
      //   isUrgent: formData.isUrgent,
      // });

      toast.success('Leave request submitted successfully');
      setFormData({
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: '',
        isUrgent: false,
      });
      onSubmitSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Request Leave
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="leaveType">Leave Type *</Label>
            <Select
              value={formData.leaveType}
              onValueChange={(value) => setFormData({ ...formData, leaveType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FULL_LEAVE">Full Leave</SelectItem>
                <SelectItem value="WORK_FROM_HOME">Work From Home</SelectItem>
                <SelectItem value="SICK_LEAVE">Sick Leave</SelectItem>
                <SelectItem value="CASUAL_LEAVE">Casual Leave</SelectItem>
                <SelectItem value="EMERGENCY_LEAVE">Emergency Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          {formData.startDate && formData.endDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                Duration: {calculateDays()} day(s)
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Please provide a reason for your leave request..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isUrgent"
              checked={formData.isUrgent}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, isUrgent: !!checked })
              }
            />
            <Label htmlFor="isUrgent" className="text-sm">
              This is an urgent request
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !formData.leaveType || !formData.startDate || !formData.endDate}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}