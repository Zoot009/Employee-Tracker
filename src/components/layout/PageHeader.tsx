// src/components/layout/PageHeader.tsx
'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onBack?: () => void;
  children?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  description, 
  icon: Icon, 
  onBack, 
  children 
}: PageHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center space-x-4">
        {onBack && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            {Icon && <Icon className="h-7 w-7 mr-2 text-primary" />}
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center space-x-2">
          {children}
        </div>
      )}
    </div>
  );
}