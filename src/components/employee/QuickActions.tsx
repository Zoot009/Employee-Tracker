// src/components/employee/QuickActions.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Coffee, FileText, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      title: 'Work Log',
      description: 'Submit your daily work entries',
      icon: Calendar,
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
      href: '/employee/work-log'
    },
    {
      title: 'Break Tracker',
      description: 'Manage your break time',
      icon: Coffee,
      color: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      href: '/employee/breaks'
    },
    {
      title: 'Report Issues',
      description: 'Submit workplace issues',
      icon: FileText,
      color: 'bg-red-100',
      iconColor: 'text-red-600',
      href: '/employee/issues'
    },
    {
      title: 'Performance',
      description: 'View your analytics',
      icon: BarChart3,
      color: 'bg-purple-100',
      iconColor: 'text-purple-600',
      href: '/employee/performance'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {actions.map((action) => (
        <Card
          key={action.title}
          className="hover:shadow-lg transition-all cursor-pointer transform hover:scale-105"
          onClick={() => router.push(action.href)}
        >
          <CardContent className="p-6 text-center">
            <div className={`rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center ${action.color}`}>
              <action.icon className={`h-8 w-8 ${action.iconColor}`} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
            <p className="text-sm text-gray-600">{action.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}