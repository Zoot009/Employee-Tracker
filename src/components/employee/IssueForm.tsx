'use client';

import React, { useState } from 'react';
import { FileText, Send } from 'lucide-react';
import { issueApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface IssueFormProps {
  employeeId: number;
  onSubmitSuccess: () => void;
}

const ISSUE_CATEGORIES = [
  'Equipment',
  'Cleanliness', 
  'Documents',
  'Stationery',
  'IT Support',
  'Other'
];

export default function IssueForm({ employeeId, onSubmitSuccess }: IssueFormProps) {
  const [formData, setFormData] = useState({
    issueCategory: '',
    issueDescription: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.issueCategory || !formData.issueDescription.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await issueApi.create({
        employeeId,
        issueCategory: formData.issueCategory,
        issueDescription: formData.issueDescription.trim(),
      });

      if (response.data.success) {
        setFormData({
          issueCategory: '',
          issueDescription: '',
        });
        onSubmitSuccess();
      }
    } catch (error) {
      console.error('Error submitting issue:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-500" />
          Report an Issue
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="issueCategory">Issue Category</Label>
            <Select
              value={formData.issueCategory}
              onValueChange={(value) => setFormData({ ...formData, issueCategory: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select issue category" />
              </SelectTrigger>
              <SelectContent>
                {ISSUE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="issueDescription">Description</Label>
            <Textarea
              id="issueDescription"
              value={formData.issueDescription}
              onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
              placeholder="Please describe the issue in detail..."
              rows={4}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !formData.issueCategory || !formData.issueDescription.trim()}
            className="w-full flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Issue'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}