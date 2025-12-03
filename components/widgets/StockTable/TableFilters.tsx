'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface TableFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const TableFilters: React.FC<TableFiltersProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search stocks..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};