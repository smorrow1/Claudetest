import { ParameterId } from '../data/defaultParameters';

export interface Tank {
  id: string;
  name: string;
  volumeGallons: number;
  type: 'reef' | 'fowlr' | 'freshwater';
  createdAt: string;
}

export interface ParameterTarget {
  parameterId: ParameterId;
  min: number;
  max: number;
}

export interface ParameterReading {
  parameterId: ParameterId;
  value: number;
}

export interface TestLog {
  id: string;
  tankId: string;
  date: string;
  readings: ParameterReading[];
  notes?: string;
}

export interface DosingChemical {
  id: string;
  tankId: string;
  name: string;
  targetDose: number;
  unit: string;
  frequencyDays: number;
}

export interface DosingLog {
  id: string;
  chemicalId: string;
  date: string;
  amountDosed: number;
  completed: boolean;
}

export interface SubscriptionState {
  isPro: boolean;
  trialStartDate: string | null;
  purchasedAt: string | null;
}
