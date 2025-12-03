import { Widget, LayoutItem } from './widget.types';

export interface DashboardState {
  widgets: Widget[];
  layout: LayoutItem[];
  selectedWidgetId: string | null;
  isConfigPanelOpen: boolean;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  widgets: Widget[];
  layout: LayoutItem[];
  thumbnail?: string;
}