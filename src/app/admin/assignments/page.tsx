// src/app/admin/assignments/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, ClipboardList, Users, Tag, AlertTriangle, CheckCircle } from 'lucide-react';
import { assignmentApi, employeeApi, tagApi } from '@/lib/api-client';
import { Assignment, Employee, Tag as TagType } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    tagId: '',
    isMandatory: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [assignmentsResponse, employeesResponse, tagsResponse] = await Promise.all([
        assignmentApi.getAll(),
        employeeApi.getAll(),
        tagApi.getAll()
      ]);

      if (assignmentsResponse.data.success) {
        setAssignments(assignmentsResponse.data.data || []);
      }
      if (employeesResponse.data.success) {
        setEmployees(employeesResponse.data.data || []);
      }
      if (tagsResponse.data.success) {
        setTags(tagsResponse.data.data || []);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.tagId) {
      toast.error('Please select both employee and tag');
      return;
    }

    setSubmitting(true);

    try {
      const response = await assignmentApi.create({
        employeeId: parseInt(formData.employeeId),
        tagId: parseInt(formData.tagId),
        isMandatory: formData.isMandatory,
      });

      if (response.data.success) {
        toast.success('Assignment created successfully');
        loadData();
        closeDialog();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create assignment';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (assignment: Assignment) => {
    const employeeName = assignment.employee?.name || 'Employee';
    const tagName = assignment.tag?.tagName || 'Tag';
    
    if (!confirm(`Remove assignment of "${tagName}" from ${employeeName}?`)) {
      return;
    }

    try {
      await assignmentApi.delete(assignment.id);
      toast.success('Assignment removed successfully');
      loadData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to remove assignment';
      toast.error(errorMessage);
    }
  };

  const openCreateDialog = () => {
    setFormData({
      employeeId: '',
      tagId: '',
      isMandatory: false,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setFormData({
      employeeId: '',
      tagId: '',
      isMandatory: false,
    });
  };

  // Group assignments by employee
  const assignmentsByEmployee = assignments.reduce((acc, assignment) => {
    const employeeId = assignment.employeeId;
    if (!acc[employeeId]) {
      acc[employeeId] = [];
    }
    acc[employeeId].push(assignment);
    return acc;
  }, {} as Record<number, Assignment[]>);

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
            <ClipboardList className="h-7 w-7 mr-2 text-primary" />
            Tag Assignments
          </h1>
          <p className="text-muted-foreground mt-1">Assign tags to employees and set mandatory requirements</p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Assignment</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Tag className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Tags</p>
                <p className="text-2xl font-bold">{tags.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ClipboardList className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Assignments</p>
                <p className="text-2xl font-bold">{assignments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments List */}
      {Object.keys(assignmentsByEmployee).length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No assignments</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Start by assigning tags to employees.
            </p>
            <Button onClick={openCreateDialog} className="mt-4">
              Create Assignment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {employees.map((employee) => {
            const employeeAssignments = assignmentsByEmployee[employee.id] || [];
            
            if (employeeAssignments.length === 0) return null;

            return (
              <Card key={employee.id}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-primary">
                        {employee.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div>{employee.name}</div>
                      <div className="text-sm text-muted-foreground font-normal">
                        {employee.employeeCode} • {employeeAssignments.length} assignments
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {employeeAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="border rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {assignment.isMandatory ? (
                              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              </div>
                            ) : (
                              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{assignment.tag?.tagName}</div>
                            <div className="text-sm text-muted-foreground">
                              {assignment.tag?.timeMinutes} min/unit • {assignment.isMandatory ? 'Mandatory' : 'Optional'}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDelete(assignment)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Assignment Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
            <DialogDescription>
              Assign a tag to an employee and set whether it's mandatory.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="employeeId">Employee</Label>
                <Select
                  value={formData.employeeId}
                  onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name} ({employee.employeeCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="tagId">Tag</Label>
                <Select
                  value={formData.tagId}
                  onValueChange={(value) => setFormData({ ...formData, tagId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id.toString()}>
                        {tag.tagName} ({tag.timeMinutes} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isMandatory"
                  checked={formData.isMandatory}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, isMandatory: !!checked })
                  }
                />
                <Label htmlFor="isMandatory" className="text-sm">
                  This is a mandatory tag
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Assignment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}