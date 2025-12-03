'use client';

import React, { useState } from 'react';
import { Plus, Download, Upload, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useThemeStore } from '@/stores/themeStore';
import { useWidgetStore } from '@/stores/widgetStore';

interface HeaderProps {
  onAddWidget: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddWidget }) => {
  const { theme, toggleTheme } = useThemeStore();
  const { widgets, layout, importDashboard, clearDashboard } = useWidgetStore();

  const handleExport = () => {
    const config = {
      widgets,
      layout,
      version: '1.0',
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finboard-dashboard-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const config = JSON.parse(event.target?.result as string);
            if (config.widgets && config.layout) {
              importDashboard(config.widgets, config.layout);
              alert('Dashboard imported successfully!');
            } else {
              alert('Invalid dashboard configuration');
            }
          } catch (error) {
            alert('Error importing dashboard');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-600 to-blue-400 flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                FinBoard
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Finance Dashboard
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={onAddWidget}
              variant="primary"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Widget</span>
            </Button>

            <Button
              onClick={handleExport}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
              title="Export Dashboard"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export</span>
            </Button>

            <Button
              onClick={handleImport}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
              title="Import Dashboard"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden md:inline">Import</span>
            </Button>

            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="sm"
              className="flex items-center justify-center w-9 h-9 p-0"
              title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};