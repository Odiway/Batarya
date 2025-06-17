// src/lib/simulationEngine.ts
import { getMaxParallelCharge } from './simulationUtils';
import { SimulationSnapshot, BatteryVisualState } from '@/types/battery'; // BatteryVisualState'i import ettik
import { BatteryUnit, BatteryModel } from '@/types/battery'; // BatteryUnit ve BatteryModel'i import ettik

export function simulateBatteriesWithTimeline(
  model: string, // Bu 'model' parametresi BatteryModel tipinde mi olmalı? Aşağıda kullanıldığı yere göre ayarlayacağız.
  quantity: number,
  totalCycles: number,
): { timeline: SimulationSnapshot[] } {
  // `model as BatteryModel` ifadesi burada tip dönüşümü yapıyor.
  // Eğer `model` parametresi zaten `BatteryModel` tipinde değilse,
  // bunu `string`'e dönüştürmek için `src/types/battery.ts` dosyasındaki `BatteryModel` tanımını `string` yapmalıyız.
  const batteryCapacityPerLine = getMaxParallelCharge(model as BatteryModel);
  const totalLines = 4;

  const batteries: BatteryUnit[] = Array.from({ length: quantity }).map((_, i) => ({
    id: i + 1,
    // Hata 1 Çözümü: 'model' ataması
    // Eğer BatteryModel string ise (types/battery.ts'de string olarak değiştirdiyseniz), string olarak atayabilirsiniz.
    // Eğer BatteryModel belirli literal stringlerse ('ModelX' gibi), o zaman model parametresini ona göre kısıtlamalıyız.
    // En basit çözüm olarak, şu anki model parametresi 'string' olduğu için, BatteryModel'ı string yaptık varsayımıyla devam ediyorum.
    // Ancak daha iyi bir çözüm için `model as BatteryModel` tip dönüşümünü kullanabiliriz.
    model: model as BatteryModel, // model parametresi doğrudan BatteryModel'a dönüştürüldü
    currentCycle: 0,
    totalCycles: totalCycles, // ✅ BatteryUnit'e 'totalCycles' eklendi (Hata 1'in çözümü için BatteryUnit'te olmalı)
    status: 'idle',
    startTime: 0, // Bu değerin Date.now() yerine bir sayı olması gerektiği varsayılıyor
    logs: [],
    lastLine: -1, // Başlangıçta hiç hatta değil anlamında -1 veya 0 olabilir.
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
        bat.lastLine = line;
        timeline.push(snapshot(currentTime, batteries, totalLines));
        currentTime += 45; // Süre birimi varsayılıyor (örn. dakika)

        bat.status = 'discharging';
        timeline.push(snapshot(currentTime, batteries, totalLines));
        currentTime += 45; // Süre birimi varsayılıyor

        bat.currentCycle += 1;
        bat.status = bat.currentCycle >= totalCycles ? 'done' : 'idle';
        timeline.push(snapshot(currentTime, batteries, totalLines));
      });
    }
    // Sonsuz döngüyü önlemek için bir güvenlik mekanizması (çok büyük bir döngüyü keser)
    // Eğer bir bug varsa ve bataryalar 'done' olmuyorsa
    if (currentTime > 100000) {
      // Belirli bir zaman eşiği, simülasyonun takılmasını önler
      console.warn('Simülasyon çok uzun sürdü, döngüden çıkılıyor.');
      break;
    }
  }

  // Döngü dışında da son durumu kaydet
  timeline.push(snapshot(currentTime, batteries, totalLines));

  return { timeline };
}

function snapshot(time: number, batteries: BatteryUnit[], totalLines: number): SimulationSnapshot {
  const lines = Array.from({ length: totalLines }).map((_, lineIdx) => ({
    line: lineIdx,
    batteries: batteries
      .filter((b) => b.lastLine === lineIdx)
      .map(
        (b) =>
          ({
            id: b.id,
            model: b.model,
            currentCycle: b.currentCycle,
            status: b.status,
            totalCycles: b.totalCycles, // ✅ Hata 2 Çözümü: BatteryVisualState'in zorunlu 'totalCycles' özelliği eklendi
          }) as BatteryVisualState,
      ), // ✅ Tip dönüşümü eklendi
  }));

  return {
    time,
    lines,
  };
}
