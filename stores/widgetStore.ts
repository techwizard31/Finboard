import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Widget, LayoutItem } from '@/types/widget.types';

interface WidgetStore {
  widgets: Widget[];
  layout: LayoutItem[];
  selectedWidgetId: string | null;
  isConfigPanelOpen: boolean;
  
  // Actions
  addWidget: (widget: Widget, layoutItem: LayoutItem) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  updateLayout: (layout: LayoutItem[]) => void;
  selectWidget: (id: string | null) => void;
  openConfigPanel: () => void;
  closeConfigPanel: () => void;
  clearDashboard: () => void;
  importDashboard: (widgets: Widget[], layout: LayoutItem[]) => void;
}

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set) => ({
      widgets: [],
      layout: [],
      selectedWidgetId: null,
      isConfigPanelOpen: false,

      addWidget: (widget, layoutItem) =>
        set((state) => ({
          widgets: [...state.widgets, widget],
          layout: [...state.layout, layoutItem],
        })),

      removeWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
          layout: state.layout.filter((l) => l.i !== id),
          selectedWidgetId: state.selectedWidgetId === id ? null : state.selectedWidgetId,
        })),

      updateWidget: (id, updates) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        })),

      updateLayout: (layout) => set({ layout }),

      selectWidget: (id) => set({ selectedWidgetId: id }),

      openConfigPanel: () => set({ isConfigPanelOpen: true }),

      closeConfigPanel: () => set({ isConfigPanelOpen: false, selectedWidgetId: null }),

      clearDashboard: () => set({ widgets: [], layout: [], selectedWidgetId: null }),

      importDashboard: (widgets, layout) => set({ widgets, layout }),
    }),
    {
      name: 'finboard-widgets',
      storage: createJSONStorage(() => localStorage),
    }
  )
);