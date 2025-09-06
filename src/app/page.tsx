// src/app/page.tsx - Enhanced Main Page with Employee Portal
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Users, Settings, BarChart3, Clock, Shield, Target, Zap } from 'lucide-react';
import { employeeApi } from '@/lib/api-client';
import { Employee } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Login form component
function LoginForm({
  employeeCode,
  setEmployeeCode,
  onSubmit,
  isLoading,
}: {
  employeeCode: string;
  setEmployeeCode: (code: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Users className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Employee Portal</CardTitle>
        <p className="text-gray-600">Enter your employee code to access your dashboard</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <Label htmlFor="employeeCode">Employee Code</Label>
            <Input
              id="employeeCode"
              type="text"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              placeholder="Enter your employee code"
              required
              autoFocus
              disabled={isLoading}
              className="mt-1"
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading || !employeeCode.trim()}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Logging in...' : 'Access Portal'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an employee code? Contact your administrator.
        </div>
      </CardContent>
    </Card>
  );
}

// Features overview component
function FeaturesOverview() {
  const features = [
    {
      icon: Clock,
      title: 'Smart Time Tracking',
      description: 'Log your work time with tag-based categorization for accurate productivity measurement',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'View detailed analytics of your work patterns, productivity trends, and achievements',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Target,
      title: 'Goal Management',
      description: 'Track mandatory and optional tasks with clear visibility into completion status',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Zap,
      title: 'Break Optimization',
      description: 'Manage your breaks effectively with built-in timers and automatic duration tracking',
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      icon: Users,
      title: 'Issue Reporting',
      description: 'Report workplace issues efficiently with categorized submission system',
      color: 'bg-red-100 text-red-600',
    },
    {
      icon: Shield,
      title: 'Data Security',
      description: 'Your work data is securely stored and accessible only to you and authorized personnel',
      color: 'bg-indigo-100 text-indigo-600',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Powerful Features for Modern Workforce
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Everything you need to track, manage, and optimize your work productivity.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-4 p-6 bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className={`p-3 rounded-lg flex-shrink-0 ${feature.color}`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-4 text-lg">Getting Started is Easy</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-semibold">1</div>
            <p className="text-blue-800 text-sm font-medium">Enter your employee code</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-semibold">2</div>
            <p className="text-blue-800 text-sm font-medium">Access your dashboard</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-semibold">3</div>
            <p className="text-blue-800 text-sm font-medium">Log your daily work</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-semibold">4</div>
            <p className="text-blue-800 text-sm font-medium">Track your progress</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [employeeCode, setEmployeeCode] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if employee is already logged in
    const savedEmployee = localStorage.getItem('employee');
    if (savedEmployee) {
      try {
        const emp = JSON.parse(savedEmployee);
        setCurrentEmployee(emp);
        // Redirect to employee dashboard
        router.push('/employee');
      } catch (error) {
        localStorage.removeItem('employee');
      }
    }
  }, [router]);

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
        const employee = response.data.data;
        setCurrentEmployee(employee);
        localStorage.setItem('employee', JSON.stringify(employee));
        toast.success(`Welcome back, ${employee.name}!`);
        // Redirect to employee dashboard
        router.push('/employee');
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

  const navigateToAdmin = () => {
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employee Tag Tracker</h1>
              <p className="text-gray-600 mt-1">Professional workforce management and productivity tracking</p>
            </div>
            <Button onClick={navigateToAdmin} variant="outline" className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Admin Panel
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Login Form */}
          <div className="order-2 lg:order-1">
            <LoginForm
              employeeCode={employeeCode}
              setEmployeeCode={setEmployeeCode}
              onSubmit={handleEmployeeLogin}
              isLoading={isLoggingIn}
            />
          </div>

          {/* Features Overview */}
          <div className="order-1 lg:order-2">
            <FeaturesOverview />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Employee Tag Tracker</h3>
            <p className="text-gray-400 text-sm">
              Streamlining workforce productivity through intelligent time tracking and analytics.
            </p>
            <div className="mt-4 text-gray-500 text-xs">
              © 2024 Employee Tag Tracker. Built for modern workplaces.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}