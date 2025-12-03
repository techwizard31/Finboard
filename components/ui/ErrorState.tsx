import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  error?: Error | string;
  retry?: () => void;
  message?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  retry,
  message,
}) => {
  const errorMessage = message || (error instanceof Error ? error.message : error) || 'Something went wrong';

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3 mb-4">
        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Error Loading Data
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-md">
        {errorMessage}
      </p>
      {retry && (
        <Button onClick={retry} variant="primary" size="sm">
          Try Again
        </Button>
      )}
    </div>
  );
};