'use client';

import React from 'react';
import { LayoutDashboard, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyDashboardProps {
  onAddWidget: () => void;
}

export const EmptyDashboard: React.FC<EmptyDashboardProps> = ({
  onAddWidget,
}) => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-6">
          <LayoutDashboard className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Welcome to FinBoard
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Get started by adding your first widget to monitor real-time financial data.
          Choose from tables, cards, or charts to customize your dashboard.
        </p>
        
        <Button
          onClick={onAddWidget}
          variant="primary"
          size="lg"
          className="inline-flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Your First Widget</span>
        </Button>

        <div className="mt-12 grid grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Stock Tables
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-xs">
              Paginated lists with filters
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Finance Cards
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-xs">
              Watchlists & market data
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Price Charts
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-xs">
              Line & candlestick charts
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};