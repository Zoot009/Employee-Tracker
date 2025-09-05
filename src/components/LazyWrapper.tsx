import { Suspense, ReactNode } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function LazyWrapper({ children, fallback }: LazyWrapperProps) {
  return (
    <Suspense
      fallback={
        fallback || (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="lg" />
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}
