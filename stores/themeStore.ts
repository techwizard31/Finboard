import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',

      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          console.log('Theme toggled from', state.theme, 'to', newTheme);
          return { theme: newTheme };
        }),

      setTheme: (theme) => {
        console.log('Theme set to:', theme);
        set({ theme });
      },
    }),
    {
      name: 'finboard-theme',
      storage: createJSONStorage(() => localStorage),
    }
  )
);