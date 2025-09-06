// src/components/layout/ErrorPage.tsx
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function ErrorPage({ 
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  showRetry = true
}: ErrorPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        {showRetry && onRetry && (
          <Button onClick={onRetry} className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        )}
      </div>
    </div>
  );
}
