'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Users, Settings, BarChart3, Clock } from 'lucide-react';
import { employeeApi } from '@/lib/api-client';
import { Employee } from '@/types';
import EmployeePanel from '@/components/employee/EmployeePanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function HomePage() {
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [employeeCode, setEmployeeCode] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeCode.trim()) {
      toast.error('Please enter your employee code');
      return;
    }

    setIsLoggingIn(true);
    
    try {
      const response = await employeeApi.login(employeeCode.trim());
      
      if (response.data.success && response.data.data) {
        setCurrentEmployee(response.data.data);
        toast.success('Login successful!');
      } else {
        toast.error('Invalid employee code');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      toast.error(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setCurrentEmployee(null);
    setEmployeeCode('');
    toast.success('Logged out successfully');
  };

  const navigateToAdmin = () => {
    router.push('/admin');
  };

  // If employee is logged in, show employee panel
  if (currentEmployee) {
    return <EmployeePanel employee={currentEmployee} onLogout={handleLogout} />;
  }

  // Show login page
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employee Tag Tracker</h1>
              <p className="text-gray-600 mt-1">Track your work time and manage tasks efficiently</p>
            </div>
            <Button onClick={navigateToAdmin} variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Admin Panel
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Login Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Employee Login</h2>
              <p className="text-gray-600 mt-2">Enter your employee code to access your dashboard</p>
            </div>

            <form onSubmit={handleEmployeeLogin} className="space-y-6">
              <Input
                type="text"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                placeholder="Enter your employee code"
                required
                autoFocus
              />
              
              <Button
                type="submit"
                disabled={isLoggingIn}
                className="w-full"
                size="lg"
              >
                Login
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Don't have an employee code? Contact your administrator.
            </div>
          </div>

          {/* Features Overview */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Features Overview
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-lg p-2 flex-shrink-0">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Time Tracking</h3>
                    <p className="text-gray-600">Track your work time based on assigned tags and tasks</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 rounded-lg p-2 flex-shrink-0">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Performance Analytics</h3>
                    <p className="text-gray-600">View your productivity charts and performance metrics</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 rounded-lg p-2 flex-shrink-0">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Break Management</h3>
                    <p className="text-gray-600">Manage your breaks with automatic time tracking</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 rounded-lg p-2 flex-shrink-0">
                    <Settings className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Issue Reporting</h3>
                    <p className="text-gray-600">Report workplace issues and track their resolution</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Getting Started</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Enter your employee code to log in</li>
                <li>• Select the date you want to log work for</li>
                <li>• Fill in your task counts and submit</li>
                <li>• Track your breaks and report any issues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}