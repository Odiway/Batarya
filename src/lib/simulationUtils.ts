// lib/simulationUtils.ts
import { BatteryModel } from '@/types/battery';

export const getMaxParallelCharge = (model: BatteryModel): number => {
  switch (model) {
    case 'TRES 35':
      return 10;
    case 'TRES 48':
    case 'TRES 70':
    case 'TRES 102':
      return 8;
    default:
      return 0;
  }
};

export interface BatteryUnit {
  lastLine: number;
  model: BatteryModel;
  id: number;
  currentCycle: number;
  totalCycles: number;
  status: 'idle' | 'charging' | 'discharging' | 'done';
  startTime: number;
  logs: string[];
}

export interface SimulationLog {
  timestamp: number;
  action: string;
  batteryId: number;
  cycle: number;
  line: number;
  status: 'charging' | 'discharging';
}
