import { create } from 'zustand';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  breadcrumbs: [],
  setBreadcrumbs: (items) => set({ breadcrumbs: items }),
}));
