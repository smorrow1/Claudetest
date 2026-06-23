import { Tank, TestLog, DosingChemical, DosingLog } from '../store/types';
import { subDays, format } from 'date-fns';

const TODAY = new Date();
const fmt = (d: Date) => format(d, 'yyyy-MM-dd');

export const MOCK_TANK: Tank = {
  id: 'tank-demo',
  name: 'Display Reef',
  volumeGallons: 120,
  type: 'reef',
  createdAt: fmt(subDays(TODAY, 90)),
};

export const MOCK_TEST_LOGS: TestLog[] = [
  {
    id: 'log-7',
    tankId: 'tank-demo',
    date: fmt(subDays(TODAY, 0)),
    notes: 'Post water change test',
    readings: [
      { parameterId: 'alk', value: 8.6 },
      { parameterId: 'cal', value: 420 },
      { parameterId: 'mag', value: 1310 },
      { parameterId: 'nitrate', value: 4.0 },
      { parameterId: 'phosphate', value: 0.04 },
      { parameterId: 'ph', value: 8.18 },
      { parameterId: 'salinity', value: 1.025 },
      { parameterId: 'temp', value: 78.2 },
    ],
  },
  {
    id: 'log-6',
    tankId: 'tank-demo',
    date: fmt(subDays(TODAY, 7)),
    readings: [
      { parameterId: 'alk', value: 8.2 },
      { parameterId: 'cal', value: 415 },
      { parameterId: 'mag', value: 1295 },
      { parameterId: 'nitrate', value: 5.5 },
      { parameterId: 'phosphate', value: 0.05 },
      { parameterId: 'ph', value: 8.15 },
      { parameterId: 'salinity', value: 1.025 },
      { parameterId: 'temp', value: 78.0 },
    ],
  },
  {
    id: 'log-5',
    tankId: 'tank-demo',
    date: fmt(subDays(TODAY, 14)),
    readings: [
      { parameterId: 'alk', value: 9.1 },
      { parameterId: 'cal', value: 405 },
      { parameterId: 'mag', value: 1280 },
      { parameterId: 'nitrate', value: 8.0 },
      { parameterId: 'phosphate', value: 0.07 },
      { parameterId: 'ph', value: 8.12 },
      { parameterId: 'salinity', value: 1.026 },
      { parameterId: 'temp', value: 78.5 },
    ],
  },
  {
    id: 'log-4',
    tankId: 'tank-demo',
    date: fmt(subDays(TODAY, 21)),
    readings: [
      { parameterId: 'alk', value: 8.8 },
      { parameterId: 'cal', value: 425 },
      { parameterId: 'mag', value: 1320 },
      { parameterId: 'nitrate', value: 6.0 },
      { parameterId: 'phosphate', value: 0.055 },
      { parameterId: 'ph', value: 8.2 },
      { parameterId: 'salinity', value: 1.025 },
      { parameterId: 'temp', value: 77.8 },
    ],
  },
];

export const MOCK_CHEMICALS: DosingChemical[] = [
  {
    id: 'chem-1',
    tankId: 'tank-demo',
    name: 'Alkalinity (2-Part A)',
    targetDose: 25,
    unit: 'mL',
    frequencyDays: 1,
  },
  {
    id: 'chem-2',
    tankId: 'tank-demo',
    name: 'Calcium (2-Part B)',
    targetDose: 25,
    unit: 'mL',
    frequencyDays: 1,
  },
  {
    id: 'chem-3',
    tankId: 'tank-demo',
    name: 'Magnesium Supplement',
    targetDose: 10,
    unit: 'mL',
    frequencyDays: 3,
  },
];

export const MOCK_DOSING_LOGS: DosingLog[] = [
  { id: 'dl-1', chemicalId: 'chem-1', date: fmt(TODAY), amountDosed: 25, completed: true },
  { id: 'dl-2', chemicalId: 'chem-2', date: fmt(TODAY), amountDosed: 25, completed: false },
  { id: 'dl-3', chemicalId: 'chem-3', date: fmt(subDays(TODAY, 1)), amountDosed: 10, completed: true },
];
