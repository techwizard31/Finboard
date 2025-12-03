import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className,
  count = 1,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'animate-pulse bg-gray-200 dark:bg-gray-800 rounded',
            className
          )}
        />
      ))}
    </>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-4">
      <SkeletonLoader className="h-6 w-3/4" />
      <SkeletonLoader className="h-4 w-full" />
      <SkeletonLoader className="h-4 w-5/6" />
      <SkeletonLoader className="h-32 w-full" />
    </div>
  );
};

export const SkeletonTable: React.FC = () => {
  return (
    <div className="space-y-3">
      <SkeletonLoader className="h-10 w-full" />
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonLoader key={index} className="h-12 w-full" />
      ))}
    </div>
  );
};