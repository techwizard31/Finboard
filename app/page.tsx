'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { AddWidgetModal } from '@/components/dashboard/AddWidgetModal';
import { EmptyDashboard } from '@/components/dashboard/EmptyDashboard';
import { WidgetConfigPanel } from '@/components/dashboard/WidgetConfigPanel';
import { useWidgetStore } from '@/stores/widgetStore';

export default function Home() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { widgets } = useWidgetStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onAddWidget={() => setIsAddModalOpen(true)} />
      
      <main className="container mx-auto px-4 py-6">
        {widgets.length === 0 ? (
          <EmptyDashboard onAddWidget={() => setIsAddModalOpen(true)} />
        ) : (
          <DashboardGrid />
        )}
      </main>

      <AddWidgetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <WidgetConfigPanel />
    </div>
  );
}