import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TestLog } from './types';
import { ParameterId } from '../data/defaultParameters';
import { format } from 'date-fns';

interface TestStore {
  logs: TestLog[];
  addLog: (log: TestLog) => void;
  deleteLog: (id: string) => void;
  getLogsForTank: (tankId: string) => TestLog[];
  getLatestLog: (tankId: string) => TestLog | null;
  getReadingsForParameter: (
    tankId: string,
    parameterId: ParameterId,
    days: number,
  ) => { date: string; value: number }[];
}

export const useTestStore = create<TestStore>()(
  persist(
    (set, get) => ({
      logs: [],

      addLog: (log) =>
        set((s) => ({
          logs: [log, ...s.logs].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
        })),

      deleteLog: (id) =>
        set((s) => ({ logs: s.logs.filter((l) => l.id !== id) })),

      getLogsForTank: (tankId) =>
        get()
          .logs.filter((l) => l.tankId === tankId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),

      getLatestLog: (tankId) => {
        const logs = get().getLogsForTank(tankId);
        return logs[0] ?? null;
      },

      getReadingsForParameter: (tankId, parameterId, days) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return get()
          .logs.filter(
            (l) => l.tankId === tankId && new Date(l.date) >= cutoff,
          )
          .map((l) => {
            const reading = l.readings.find((r) => r.parameterId === parameterId);
            return reading ? { date: l.date, value: reading.value } : null;
          })
          .filter(Boolean) as { date: string; value: number }[];
      },
    }),
    {
      name: 'reeflog-tests',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
