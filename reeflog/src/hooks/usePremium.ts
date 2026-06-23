import { useSubscriptionStore } from '../store/subscriptionStore';

export function usePremium() {
  const store = useSubscriptionStore();
  return {
    isPro: store.isPro,
    hasAccess: store.hasAccess(),
    isTrialActive: store.isTrialActive(),
    trialDaysRemaining: store.getTrialDaysRemaining(),
    canAddChemical: store.canAddChemical,
    canAddTestLog: store.canAddTestLog,
    canViewHistory: store.canViewHistory,
    startTrial: store.startTrial,
    unlockPro: store.unlockPro,
  };
}
