// types/battery.ts
export interface BatteryUnit {
  id: number;
  model: BatteryModel;
  currentCycle: number;
  totalCycles: number; // ✅ Yeni eklendi (simulationEngine.ts'deki atama için)
  status: 'idle' | 'charging' | 'discharging' | 'done';
  startTime: number; // Zaman damgası veya döngü zamanı
  logs: []; // 'never[]' yerine 'any[]' kullandık, daha esnek
  lastLine: number;
}

export type BatteryModel = 'TRES 35' | 'TRES 48' | 'TRES 70' | 'TRES 102';
export type BatteryVisualState = {
  id: number;
  model: string;
  currentCycle: number;
  status: 'charging' | 'discharging' | 'idle' | 'done';
  totalCycles: number;
};

export type LineVisualState = {
  line: number;
  batteries: BatteryVisualState[];
};

export type SimulationSnapshot = {
  time: number;
  lines: LineVisualState[];
};

export interface SimulationInput {
  model: BatteryModel;
  quantity: number;
  totalCycles: number;
  lineNumber: number;
}
