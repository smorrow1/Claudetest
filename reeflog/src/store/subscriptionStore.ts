import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubscriptionState } from './types';
import { differenceInDays, format } from 'date-fns';

const TRIAL_DAYS = 14;
const FREE_ENTRY_LIMIT = 30;
const FREE_CHEMICAL_LIMIT = 2;

interface SubscriptionStore extends SubscriptionState {
  startTrial: () => void;
  unlockPro: () => void; // TODO: call after successful IAP
  getTrialDaysRemaining: () => number;
  isTrialActive: () => boolean;
  hasAccess: () => boolean; // pro or active trial
  canAddChemical: (currentCount: number) => boolean;
  canAddTestLog: (currentCount: number) => boolean;
  canViewHistory: (days: number) => boolean;
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      isPro: false,
      trialStartDate: null,
      purchasedAt: null,

      startTrial: () =>
        set({
          trialStartDate: format(new Date(), 'yyyy-MM-dd'),
        }),

      unlockPro: () =>
        set({
          isPro: true,
          purchasedAt: format(new Date(), 'yyyy-MM-dd'),
        }),

      getTrialDaysRemaining: () => {
        const { trialStartDate } = get();
        if (!trialStartDate) return 0;
        const elapsed = differenceInDays(new Date(), new Date(trialStartDate));
        return Math.max(0, TRIAL_DAYS - elapsed);
      },

      isTrialActive: () => {
        const { trialStartDate } = get();
        if (!trialStartDate) return false;
        return get().getTrialDaysRemaining() > 0;
      },

      hasAccess: () => {
        const { isPro } = get();
        return isPro || get().isTrialActive();
      },

      canAddChemical: (currentCount) =>
        get().hasAccess() || currentCount < FREE_CHEMICAL_LIMIT,

      canAddTestLog: (currentCount) =>
        get().hasAccess() || currentCount < FREE_ENTRY_LIMIT,

      canViewHistory: (days) =>
        get().hasAccess() || days <= 7,
    }),
    {
      name: 'reeflog-subscription',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
