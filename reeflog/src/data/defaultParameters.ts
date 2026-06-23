export type ParameterId =
  | 'alk'
  | 'cal'
  | 'mag'
  | 'nitrate'
  | 'phosphate'
  | 'ph'
  | 'salinity'
  | 'temp';

export interface ParameterDefinition {
  id: ParameterId;
  label: string;
  unit: string;
  defaultMin: number;
  defaultMax: number;
  idealMin: number;
  idealMax: number;
  description: string;
  decimalPlaces: number;
  step: number;
}

export const PARAMETERS: ParameterDefinition[] = [
  {
    id: 'alk',
    label: 'Alkalinity',
    unit: 'dKH',
    defaultMin: 7,
    defaultMax: 11,
    idealMin: 8,
    idealMax: 9.5,
    description: 'Critical for coral skeleton growth. Swings > 1 dKH/day stress SPS corals.',
    decimalPlaces: 1,
    step: 0.1,
  },
  {
    id: 'cal',
    label: 'Calcium',
    unit: 'ppm',
    defaultMin: 380,
    defaultMax: 450,
    idealMin: 400,
    idealMax: 430,
    description: 'Used by corals and coralline algae. Closely linked to alkalinity.',
    decimalPlaces: 0,
    step: 5,
  },
  {
    id: 'mag',
    label: 'Magnesium',
    unit: 'ppm',
    defaultMin: 1200,
    defaultMax: 1400,
    idealMin: 1250,
    idealMax: 1350,
    description: 'Stabilizes calcium and alkalinity balance. Often overlooked.',
    decimalPlaces: 0,
    step: 10,
  },
  {
    id: 'nitrate',
    label: 'Nitrate',
    unit: 'ppm',
    defaultMin: 0,
    defaultMax: 20,
    idealMin: 1,
    idealMax: 10,
    description: 'Too low starves corals. Too high causes algae problems.',
    decimalPlaces: 1,
    step: 0.5,
  },
  {
    id: 'phosphate',
    label: 'Phosphate',
    unit: 'ppm',
    defaultMin: 0,
    defaultMax: 0.1,
    idealMin: 0.02,
    idealMax: 0.08,
    description: 'Elevated phosphate inhibits calcification and causes algae.',
    decimalPlaces: 3,
    step: 0.005,
  },
  {
    id: 'ph',
    label: 'pH',
    unit: '',
    defaultMin: 7.8,
    defaultMax: 8.5,
    idealMin: 8.1,
    idealMax: 8.3,
    description: 'Fluctuates naturally through the day. Measure at same time each day.',
    decimalPlaces: 2,
    step: 0.01,
  },
  {
    id: 'salinity',
    label: 'Salinity',
    unit: 'SG',
    defaultMin: 1.024,
    defaultMax: 1.027,
    idealMin: 1.025,
    idealMax: 1.026,
    description: 'Specific gravity. Maintain consistent to avoid osmotic stress.',
    decimalPlaces: 3,
    step: 0.001,
  },
  {
    id: 'temp',
    label: 'Temperature',
    unit: '°F',
    defaultMin: 76,
    defaultMax: 80,
    idealMin: 77,
    idealMax: 79,
    description: 'Stable temperature prevents stress. Avoid swings > 2°F/day.',
    decimalPlaces: 1,
    step: 0.5,
  },
];

export const getParameter = (id: ParameterId): ParameterDefinition =>
  PARAMETERS.find((p) => p.id === id)!;
