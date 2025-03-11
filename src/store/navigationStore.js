import { create } from 'zustand';

export const useNavigationStore = create((set) => ({
  activeMenu: 'dashboard',
  setActiveMenu: (menuId) => set({ activeMenu: menuId }),
})); 