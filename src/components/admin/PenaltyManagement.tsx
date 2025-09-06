// src/components/admin/PenaltyManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { DollarSign, Plus, Users, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Penalty {
  id: number;
  employeeId: number;
  attendanceId?: number;
  penaltyType: 'ATTENDANCE_DEDUCTION' | 'LATE_PENALTY' | 'UNAUTHORIZED_ABSENCE' | 'POLICY_VIOLATION' | 'OTHER';
  amount?: number;
  description: string;
  penaltyDate: string;
  issuedBy?: number;
  isPaid: boolean;
  paidAt?: string;
  notes?: string;
  employee?: {
    id: number;
    name: string;
    employeeCode: string;
  };
}

export default function PenaltyManagement() {
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    penaltyType: '',
    amount: '',
    description: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  useEffect(() => {
    loadPenalties();
    loadEmployees();
  }, [statusFilter]);

  const loadPenalties = async () => {
    try {
      setLoading(true);
      // API call would go here
      // const response = await penaltyApi.getAll({
      //   isPaid: statusFilter !== 'all' ? statusFilter === 'paid' : undefined
      // });
      
      // Mock data
      const mockData: Penalty[] = [
        {
          id: 1,
          employeeId: 1,
          penaltyType: 'UNAUTHORIZED_ABSENCE',
          amount: 500,
          description: 'Unauthorized absence on working day',
          penaltyDate: '2024-01-15',
          isPaid: false,
          employee: {
            id: 1,
            name: 'John Doe',
            employeeCode: 'EMP001'
          }
        }
      ];
      setPenalties(mockData);
    } catch (error) {
      toast.error('Failed to load penalties');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      // API call would go here
      setEmployees([
        { id: 1, name: 'John Doe', employeeCode: 'EMP001' },
        { id: 2, name: 'Jane Smith', employeeCode: 'EMP002' }
      ]);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.penaltyType || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // API call would go here
      // await penaltyApi.create({
      //   employeeId: parseInt(formData.employeeId),
      //   penaltyType: formData.penaltyType,
      //   amount: formData.amount ? parseFloat(formData.amount) : undefined,
      //   description: formData.description,
      //   notes: formData.notes || undefined,
      // });

      toast.success('Penalty issued successfully');
      setIsDialogOpen(false);
      setFormData({
        employeeId: '',
        penaltyType: '',
        amount: '',
        description: '',
        notes: '',
      });
      loadPenalties();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to issue penalty');
    } finally {
      setSubmitting(false);
    }
  };

  const markAsPaid = async (penaltyId: number) => {
    try {
      // API call would go here
      // await penaltyApi.markPaid(penaltyId);
      toast.success('Penalty marked as paid');
      loadPenalties();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update penalty');
    }
  };

  const getPenaltyTypeColor = (type: string) => {
    switch (type) {
      case 'ATTENDANCE_DEDUCTION':
        return 'bg-red-100 text-red-800';
      case 'LATE_PENALTY':
        return 'bg-yellow-100 text-yellow-800';
      case 'UNAUTHORIZED_ABSENCE':
        return 'bg-red-100 text-red-800';
      case 'POLICY_VIOLATION':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPenaltyType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const filteredPenalties = penalties.filter(penalty => {
    if (statusFilter === 'paid' && !penalty.isPaid) return false;
    if (statusFilter === 'unpaid' && penalty.isPaid) return false;
    return true;
  });

  const stats = {
    total: penalties.length,
    paid: penalties.filter(p => p.isPaid).length,
    unpaid: penalties.filter(p => !p.isPaid).length,
    totalAmount: penalties.reduce((sum, p) => sum + (p.amount || 0), 0),
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
            <DollarSign className="h-7 w-7 mr-2 text-primary" />
            Penalty Management
          </h1>
          <p className="text-muted-foreground mt-1">Issue and manage employee penalties</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Penalties</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Issue Penalty
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Penalties</p>
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
                <p className="text-sm font-medium text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold">{stats.paid}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Unpaid</p>
                <p className="text-2xl font-bold">{stats.unpaid}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">₹{stats.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Penalties List */}
      <Card>
        <CardHeader>
          <CardTitle>Penalty Records</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPenalties.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No penalties found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No penalty records found for the selected filter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPenalties.map((penalty) => (
                <div key={penalty.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <DollarSign className="h-5 w-5 text-red-500" />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {penalty.employee?.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {penalty.employee?.employeeCode} • 
                            Issued on {new Date(penalty.penaltyDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <Label className="text-xs text-gray-500">Type</Label>
                          <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPenaltyTypeColor(penalty.penaltyType)}`}>
                            {formatPenaltyType(penalty.penaltyType)}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Amount</Label>
                          <p className="text-sm font-medium">
                            {penalty.amount ? `₹${penalty.amount.toLocaleString()}` : 'No amount'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Status</Label>
                          <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            penalty.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {penalty.isPaid ? 'Paid' : 'Unpaid'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <Label className="text-xs text-gray-500">Description</Label>
                        <p className="text-sm text-gray-700">{penalty.description}</p>
                      </div>
                      
                      {penalty.notes && (
                        <div className="bg-gray-50 border rounded-lg p-3">
                          <Label className="text-xs text-gray-500">Notes</Label>
                          <p className="text-sm text-gray-700">{penalty.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!penalty.isPaid && (
                        <Button
                          onClick={() => markAsPaid(penalty.id)}
                          variant="outline"
                          size="sm"
                        >
                          Mark as Paid
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Issue Penalty Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Issue Penalty</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="employee">Employee *</Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
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

            <div>
              <Label htmlFor="penaltyType">Penalty Type *</Label>
              <Select
                value={formData.penaltyType}
                onValueChange={(value) => setFormData({ ...formData, penaltyType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select penalty type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ATTENDANCE_DEDUCTION">Attendance Deduction</SelectItem>
                  <SelectItem value="LATE_PENALTY">Late Penalty</SelectItem>
                  <SelectItem value="UNAUTHORIZED_ABSENCE">Unauthorized Absence</SelectItem>
                  <SelectItem value="POLICY_VIOLATION">Policy Violation</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Enter penalty amount"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the reason for this penalty..."
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Issuing...' : 'Issue Penalty'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}