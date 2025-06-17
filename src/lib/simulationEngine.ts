import { getMaxParallelCharge, BatteryUnit } from './simulationUtils';
import { SimulationSnapshot } from '@/types/battery';
import { BatteryModel } from '@/types/battery';

export function simulateBatteriesWithTimeline(
  model: string,
  quantity: number,
  totalCycles: number,
): { timeline: SimulationSnapshot[] } {
  const batteryCapacityPerLine = getMaxParallelCharge(model as BatteryModel);
  const totalLines = 4;

  const batteries: BatteryUnit[] = Array.from({ length: quantity }).map((_, i) => ({
    id: i + 1,
    model, // eksikse model’i de ekle
    currentCycle: 0,
    totalCycles,
    status: 'idle',
    startTime: 0,
    logs: [],
    lastLine: 1, // ✅ undefined yerine varsayılan sayı
  }));

  let currentTime = 0;
  const timeline: SimulationSnapshot[] = [];

  while (batteries.some((b) => b.currentCycle < totalCycles)) {
    for (let line = 0; line < totalLines; line++) {
      const availableBatteries = batteries.filter(
        (b) => b.status === 'idle' && b.currentCycle < totalCycles,
      );
      const toCharge = availableBatteries.slice(0, batteryCapacityPerLine);

      if (toCharge.length === 0) continue;

      toCharge.forEach((bat) => {
        bat.status = 'charging';
        bat.lastLine = line; // ✅ Şarj olduğu hattı kaydet
        timeline.push(snapshot(currentTime, batteries, totalLines));
        currentTime += 45;

        bat.status = 'discharging';
        timeline.push(snapshot(currentTime, batteries, totalLines));
        currentTime += 45;

        bat.currentCycle += 1;
        bat.status = bat.currentCycle >= totalCycles ? 'done' : 'idle';
        timeline.push(snapshot(currentTime, batteries, totalLines));
      });
    }
  }

  // ✅ Döngü dışında da son durumu kaydet
  timeline.push(snapshot(currentTime, batteries, totalLines));

  return { timeline };
}

function snapshot(time: number, batteries: BatteryUnit[], totalLines: number): SimulationSnapshot {
  const lines = Array.from({ length: totalLines }).map((_, lineIdx) => ({
    line: lineIdx,
    batteries: batteries
      .filter((b) => b.lastLine === lineIdx)
      .map((b) => ({
        id: b.id,
        model: b.model, // ✅ Gerçek modeli göster
        currentCycle: b.currentCycle,
        status: b.status,
      })),
  }));

  return {
    time,
    lines,
  };
}
