'use client';

import React from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { useWidgetStore } from '@/stores/widgetStore';
import { WidgetWrapper } from '@/components/widgets/WidgetWrapper';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export const DashboardGrid: React.FC = () => {
  const { widgets, layout, updateLayout } = useWidgetStore();

  const layouts = {
    lg: layout,
    md: layout.map((item) => ({ ...item, w: Math.min(item.w, 8) })),
    sm: layout.map((item) => ({ ...item, w: Math.min(item.w, 6), x: 0 })),
    xs: layout.map((item) => ({ ...item, w: 4, x: 0 })),
  };

  const handleLayoutChange = (currentLayout: Layout[]) => {
    const updatedLayout = currentLayout.map((item) => ({
      i: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
    }));
    updateLayout(updatedLayout);
  };

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
      cols={{ lg: 12, md: 8, sm: 6, xs: 4 }}
      rowHeight={100}
      isDraggable={true}
      isResizable={true}
      onLayoutChange={handleLayoutChange}
      draggableHandle=".drag-handle"
      compactType="vertical"
    >
      {widgets.map((widget) => (
        <div key={widget.id}>
          <WidgetWrapper widget={widget} />
        </div>
      ))}
    </ResponsiveGridLayout>
  );
};