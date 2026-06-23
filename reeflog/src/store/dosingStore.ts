import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DosingChemical, DosingLog } from './types';
import { format } from 'date-fns';

interface DosingStore {
  chemicals: DosingChemical[];
  logs: DosingLog[];

  addChemical: (chemical: DosingChemical) => void;
  deleteChemical: (id: string) => void;
  updateChemical: (id: string, updates: Partial<DosingChemical>) => void;
  getChemicalsForTank: (tankId: string) => DosingChemical[];

  logDose: (log: DosingLog) => void;
  toggleDoseComplete: (chemicalId: string, date: string) => void;
  getTodayLog: (chemicalId: string) => DosingLog | null;
  getLastDosed: (chemicalId: string) => string | null;
  isDueToday: (chemical: DosingChemical) => boolean;
}

const today = () => format(new Date(), 'yyyy-MM-dd');

export const useDosingStore = create<DosingStore>()(
  persist(
    (set, get) => ({
      chemicals: [],
      logs: [],

      addChemical: (chemical) =>
        set((s) => ({ chemicals: [...s.chemicals, chemical] })),

      deleteChemical: (id) =>
        set((s) => ({ chemicals: s.chemicals.filter((c) => c.id !== id) })),

      updateChemical: (id, updates) =>
        set((s) => ({
          chemicals: s.chemicals.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        })),

      getChemicalsForTank: (tankId) =>
        get().chemicals.filter((c) => c.tankId === tankId),

      logDose: (log) =>
        set((s) => {
          const existing = s.logs.findIndex(
            (l) => l.chemicalId === log.chemicalId && l.date === log.date,
          );
          if (existing >= 0) {
            const updated = [...s.logs];
            updated[existing] = log;
            return { logs: updated };
          }
          return { logs: [...s.logs, log] };
        }),

      toggleDoseComplete: (chemicalId, date) => {
        const existing = get().logs.find(
          (l) => l.chemicalId === chemicalId && l.date === date,
        );
        const chemical = get().chemicals.find((c) => c.id === chemicalId);
        if (!chemical) return;

        const updatedLog: DosingLog = existing
          ? { ...existing, completed: !existing.completed }
          : {
              id: `dl-${Date.now()}`,
              chemicalId,
              date,
              amountDosed: chemical.targetDose,
              completed: true,
            };

        get().logDose(updatedLog);
      },

      getTodayLog: (chemicalId) => {
        const t = today();
        return get().logs.find((l) => l.chemicalId === chemicalId && l.date === t) ?? null;
      },

      getLastDosed: (chemicalId) => {
        const logs = get()
          .logs.filter((l) => l.chemicalId === chemicalId && l.completed)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return logs[0]?.date ?? null;
      },

      isDueToday: (chemical) => {
        const lastDosed = get().getLastDosed(chemical.id);
        if (!lastDosed) return true;
        const daysSince = Math.floor(
          (new Date().getTime() - new Date(lastDosed).getTime()) / 86400000,
        );
        return daysSince >= chemical.frequencyDays;
      },
    }),
    {
      name: 'reeflog-dosing',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
