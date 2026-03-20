import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const XP_PER_LEVEL = 500;

const useStore = create(
  persist(
    (set, get) => ({
      xp: 0,
      streak: 0,
      lastStreakDate: null,
      activeTab: 'Dashboard',
      darkMode: false,

      addXP: (amount) => set((state) => ({ xp: state.xp + amount })),

      checkAndUpdateStreak: () => {
        const today = new Date().toDateString();
        const { lastStreakDate, streak } = get();
        if (lastStreakDate === today) return;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const wasYesterday = lastStreakDate === yesterday.toDateString();
        set({ streak: wasYesterday ? streak + 1 : 1, lastStreakDate: today });
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      toggleDarkMode: () => {
        const next = !get().darkMode;
        set({ darkMode: next });
        if (next) document.body.classList.add('dark');
        else document.body.classList.remove('dark');
      },

      applyDarkMode: () => {
        if (get().darkMode) document.body.classList.add('dark');
        else document.body.classList.remove('dark');
      },
    }),
    {
      name: 'dashboard-santiago-store',
      partialize: (state) => ({
        xp: state.xp,
        streak: state.streak,
        lastStreakDate: state.lastStreakDate,
        activeTab: state.activeTab,
        darkMode: state.darkMode,
      }),
    }
  )
);

export default useStore;
export { XP_PER_LEVEL };