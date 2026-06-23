import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tank, ParameterTarget } from './types';
import { PARAMETERS } from '../data/defaultParameters';

interface TankStore {
  tanks: Tank[];
  activeTankId: string | null;
  parameterTargets: Record<string, ParameterTarget[]>; // tankId -> targets
  hasCompletedOnboarding: boolean;

  addTank: (tank: Tank) => void;
  setActiveTank: (id: string) => void;
  updateTank: (id: string, updates: Partial<Tank>) => void;
  getActiveTank: () => Tank | null;
  getTargets: (tankId: string) => ParameterTarget[];
  updateTarget: (tankId: string, target: ParameterTarget) => void;
  completeOnboarding: () => void;
}

const defaultTargets = (): ParameterTarget[] =>
  PARAMETERS.map((p) => ({
    parameterId: p.id,
    min: p.defaultMin,
    max: p.defaultMax,
  }));

export const useTankStore = create<TankStore>()(
  persist(
    (set, get) => ({
      tanks: [],
      activeTankId: null,
      parameterTargets: {},
      hasCompletedOnboarding: false,

      addTank: (tank) =>
        set((s) => ({
          tanks: [...s.tanks, tank],
          activeTankId: tank.id,
          parameterTargets: {
            ...s.parameterTargets,
            [tank.id]: defaultTargets(),
          },
        })),

      setActiveTank: (id) => set({ activeTankId: id }),

      updateTank: (id, updates) =>
        set((s) => ({
          tanks: s.tanks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      getActiveTank: () => {
        const { tanks, activeTankId } = get();
        return tanks.find((t) => t.id === activeTankId) ?? null;
      },

      getTargets: (tankId) => {
        const targets = get().parameterTargets[tankId];
        return targets ?? defaultTargets();
      },

      updateTarget: (tankId, target) =>
        set((s) => {
          const existing = s.parameterTargets[tankId] ?? defaultTargets();
          return {
            parameterTargets: {
              ...s.parameterTargets,
              [tankId]: existing.map((t) =>
                t.parameterId === target.parameterId ? target : t,
              ),
            },
          };
        }),

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
    }),
    {
      name: 'reeflog-tanks',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
