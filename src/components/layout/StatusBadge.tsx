// src/components/layout/StatusBadge.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'pending' | 'info';
  text: string;
  variant?: 'default' | 'outline';
}

export function StatusBadge({ status, text, variant = 'default' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'error':
        return {
          icon: XCircle,
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'pending':
        return {
          icon: Clock,
          className: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      case 'info':
      default:
        return {
          icon: CheckCircle,
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
    }
  };

  const { icon: Icon, className } = getStatusConfig();

  return (
    <Badge variant={variant} className={className}>
      <Icon className="w-3 h-3 mr-1" />
      {text}
    </Badge>
  );
}