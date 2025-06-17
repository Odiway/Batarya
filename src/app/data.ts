// src/data.ts
import {
  GarageUnit,
  Shelf,
  GarageDoor,
  Vehicle,
  Personnel,
  LabTable,
  BatterySpotWelder,
  BatteryControlUnit,
  WorkLine,
  ChargeDischargeLine,
  MaterialCabinet,
  BatteryModel,
  ChargingBatteryDetail,
  ShelfItem,
  MeasurementBench,
  ProductionLine, // Ensure these types are imported
} from './types';

// Yardımcı fonksiyonlar (rastgele veri üretmek için)
const getRandomStatus = <T extends string>(statuses: T[]): T =>
  statuses[Math.floor(Math.random() * statuses.length)];

const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomItems = (count: number): ShelfItem[] => {
  const items = [
    'Rulman',
    'Vida Seti',
    'Sensör',
    'Kablo Demeti',
    'Motor Yağı',
    'Fren Balatası',
    'Filtre',
    'Akümülatör',
    'Motor Parçası',
    'Şasi Elemanı',
  ];
  return Array.from({ length: count }, () => ({
    id: `item-${Math.random().toString(36).substring(2, 9)}`, // Use substring for modern JS
    name: items[getRandomInt(0, items.length - 1)],
    quantity: getRandomInt(1, 50),
    criticalLevel: Math.random() > 0.85, // Daha nadir kritik seviye
  }));
};

const getRandomBatteryModel = (): BatteryModel => {
  const models: BatteryModel[] = ['TRESS 35', 'TRESS 48', 'TRESS 75', 'TRESS 102'];
  return models[getRandomInt(0, models.length - 1)];
};

// Yardımcı fonksiyon: Raf tiplerini daha kolay oluşturmak için
const createShelfWithSections = (
  id: number,
  label: string,
  sectionCount: number,
  itemsPerSection: number,
): Shelf => ({
  id,
  label,
  sections: Array.from({ length: sectionCount }, (_, j) => ({
    id: getRandomInt(1, 9999), // Unique ID for section
    label: `Bölme ${j + 1}`,
    items: getRandomItems(getRandomInt(0, itemsPerSection)),
    isEmpty: Math.random() > 0.8, // %20 boş olma ihtimali
  })),
  critical: Math.random() > 0.7, // Raf genel kritik mi
});

// --- Orijinal Dummy Data (Şimdi export edildi ve yeni Shelf yapısına uygun!) ---
// Bu raflar sayfa içinde kullanılmayabilir ama component testleri veya eski bağlantılar için bırakılıyor.
export const shelves: Shelf[] = Array.from({ length: 17 }, (_, i) => ({
  id: i + 1,
  label: `Eski Raf ${i + 1}`, // Ayırt etmek için "Eski" eklendi
  sections: [
    {
      id: getRandomInt(1, 9999),
      label: `Tek Bölme`,
      items: getRandomItems(getRandomInt(1, 5)),
      isEmpty: Math.random() > 0.7,
    },
  ],
  critical: Math.random() > 0.7,
}));

export const productionLines: ProductionLine[] = [
  // Export keyword is critical here
  {
    currentBatteryModel: getRandomBatteryModel(),
    id: 1,
    name: 'Üretim Hattı 1',
    status: 'active',
    energyConsumption: 320,
    operators: ['Usta Ahmet', 'Usta Ayşe'],
    partsProduced: 124,
    progress: getRandomInt(0, 100), // Added progress
  },
  {
    currentBatteryModel: getRandomBatteryModel(),
    id: 2,
    name: 'Üretim Hattı 2',
    status: 'paused',
    energyConsumption: 0,
    operators: [],
    partsProduced: 87,
    progress: 0, // Added progress
  },
];

export const benches: MeasurementBench[] = [
  // Export keyword is critical here
  {
    id: 1,
    name: 'Sehpa 1',
    status: 'working',
    assignedTo: 'Usta Mehmet',
    lastMeasuredAt: '14:03',
  },
  {
    id: 2,
    name: 'Sehpa 2',
    status: 'idle',
  },
];

// --- Dış Alan Verileri ---
export const garageUnits: GarageUnit[] = [
  { id: 1, label: 'Garaj Ünite 1', status: getRandomStatus(['full', 'active_work', 'empty']) },
  { id: 2, label: 'Garaj Ünite 2', status: getRandomStatus(['full', 'active_work', 'empty']) },
];

export const garageSideShelf: Shelf = createShelfWithSections(100, 'Garaj Yanı Raf', 4, 3);

export const garageDoor: GarageDoor = {
  id: 1,
  name: 'Ana Garaj Kapısı',
  status: getRandomStatus(['open', 'closed']),
};

export const vehicles: Vehicle[] = [
  {
    id: 1,
    name: 'Golf Aracı',
    type: 'golf_car',
    status: getRandomStatus(['in_garage', 'outside']),
  },
  {
    id: 2,
    name: 'Mini Kamyonet',
    type: 'mini_truck',
    status: getRandomStatus(['in_garage', 'outside']),
  },
];

// --- Zemin Kat Verileri ---

// Batarya Bölümü Yöneticisi (Batarya Bölümü İçinde)
export const batterySectionManager: Personnel = {
  id: 1,
  name: 'Burak Yılmaz',
  title: 'Batarya Bölümü Yöneticisi',
  status: getRandomStatus([
    'in_meeting',
    'busy',
    'working_on_site',
    'on_business_trip',
    'in_another_department',
    'available',
  ]),
};

// E-Lab Yöneticisi (Ayrı)
export const elabManager: Personnel = {
  id: 2,
  name: 'Cemre Demir',
  title: 'E-Lab Yöneticisi',
  status: getRandomStatus([
    'in_meeting',
    'busy',
    'working_on_site',
    'on_business_trip',
    'in_another_department',
    'available',
  ]),
};

export const elabStatus = getRandomStatus(['empty', 'busy', 'under_maintenance']);

export const batterySectionStatus = getRandomStatus([
  'charging',
  'discharging',
  'in_storage',
  'under_maintenance',
  'ready',
]);

export const batteryLabTables: LabTable[] = [
  {
    id: 1,
    name: 'Üretim Mühendisi Masası',
    status: getRandomStatus(['empty', 'in_use', 'working']),
    type: 'production_engineer',
  },
  { id: 2, name: 'Usta Masası 1', status: getRandomStatus(['empty', 'in_use']), type: 'master' },
  { id: 3, name: 'Usta Masası 2', status: getRandomStatus(['empty', 'in_use']), type: 'master' },
];

export const generalShelves: Shelf[] = Array.from({ length: 6 }, (_, i) =>
  createShelfWithSections(i + 2, `Genel Raf ${i + 1}`, 3, 4),
);

export const dcEnergyLabTable: LabTable = {
  id: 4,
  name: 'Ayarlanabilir DC Enerji Masası',
  status: getRandomStatus(['working', 'ready', 'faulty']),
  type: 'dc_energy',
};

export const workLines: WorkLine[] = [
  {
    id: 1,
    name: 'Montaj/Demontaj Hattı 1',
    status: getRandomStatus(['idle', 'working', 'faulty', 'maintenance']),
    currentBatteryModel: Math.random() > 0.5 ? getRandomBatteryModel() : undefined,
    progress: getRandomInt(0, 100),
  },
  {
    id: 2,
    name: 'Montaj/Demontaj Hattı 2',
    status: getRandomStatus(['idle', 'working', 'faulty', 'maintenance']),
    currentBatteryModel: Math.random() > 0.5 ? getRandomBatteryModel() : undefined,
    progress: getRandomInt(0, 100),
  },
];

export const monitorStationStatus = getRandomStatus(['open', 'closed']);
export const batteryLabTables2ndRoom: LabTable[] = Array.from({ length: 3 }, (_, i) => ({
  id: i + 5,
  name: `Lab Masası ${i + 1} (2. Oda)`,
  status: getRandomStatus(['empty', 'in_use', 'faulty']),
}));

export const batterySpotWelder: BatterySpotWelder = {
  id: 1,
  name: 'Pil Punta Makinası',
  status: getRandomStatus(['ready', 'working', 'faulty']),
};

export const batteryControlUnit: BatteryControlUnit = {
  id: 1,
  name: 'Batarya Kontrol Ünitesi',
  status: getRandomStatus(['working', 'standby', 'faulty']),
};

export const chargeDischargeLines: ChargeDischargeLine[] = Array.from({ length: 4 }, (_, i) => {
  const hasBatteries = Math.random() > 0.3; // %70 ihtimalle batarya var
  const numBatteries = hasBatteries ? getRandomInt(1, 3) : 0; // 1-3 batarya
  const batteries: ChargingBatteryDetail[] = hasBatteries
    ? Array.from({ length: numBatteries }, (_, j) => ({
        id: `batt-${i}-${j}-${Math.random().toString(36).substring(2, 5)}`,
        model: getRandomBatteryModel(),
        targetCycles: getRandomInt(5, 15),
        completedCycles: getRandomInt(0, 7),
        cycleDurationMinutes: getRandomInt(30, 180),
        status: getRandomStatus(['charging', 'discharging', 'finished', 'error']),
      }))
    : [];

  return {
    id: i + 1,
    name: `Şarj/Deşarj Hattı ${i + 1}`,
    status: hasBatteries ? getRandomStatus(['charging', 'discharging']) : 'idle',
    batteries: batteries,
    totalBatteriesInLine: batteries.length,
  };
});

export const warehouseShelves: Shelf[] = Array.from({ length: 6 }, (_, i) =>
  createShelfWithSections(i + 10, `Ambar Raf ${i + 1}`, 4, 5),
);

export const materialCabinet: MaterialCabinet = {
  id: 1,
  name: 'Malzeme Dolabı',
  sections: Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    label: `Bölme ${i + 1}`,
    items: getRandomItems(getRandomInt(0, 2)), // 0-1 arası ürün
  })),
};

export const nonBusProjectShelves: Shelf[] = Array.from({ length: 3 }, (_, i) =>
  createShelfWithSections(i + 20, `Non-Bus Proje Raf ${i + 1}`, 6, 3),
);

// --- Üst Kat Verileri ---
export const upperFloorPersonnel: Personnel[] = [
  {
    id: 101,
    name: 'Gizem Güneş',
    title: 'Makine Ressamlığı Mühendisi',
    status: getRandomStatus([
      'in_meeting',
      'busy',
      'working_on_site',
      'on_business_trip',
      'in_another_department',
      'available',
    ]),
  },
  {
    id: 102,
    name: 'Caner Yıldız',
    title: 'Makine Ressamlığı Mühendisi',
    status: getRandomStatus([
      'in_meeting',
      'busy',
      'working_on_site',
      'on_business_trip',
      'in_another_department',
      'available',
    ]),
  },
  {
    id: 103,
    name: 'Deniz Kara',
    title: 'Elektrik Elektronik Mühendisi',
    status: getRandomStatus([
      'in_meeting',
      'busy',
      'working_on_site',
      'on_business_trip',
      'in_another_department',
      'available',
    ]),
  },
  {
    id: 104,
    name: 'Emre Akın',
    title: 'Elektrik Elektronik Mühendisi',
    status: getRandomStatus([
      'in_meeting',
      'busy',
      'working_on_site',
      'on_business_trip',
      'in_another_department',
      'available',
    ]),
  },
  {
    id: 105,
    name: 'Figen Toprak',
    title: 'Elektrik Elektronik Mühendisi',
    status: getRandomStatus([
      'in_meeting',
      'busy',
      'working_on_site',
      'on_business_trip',
      'in_another_department',
      'available',
    ]),
  },
  {
    id: 106,
    name: 'Gökhan Bulut',
    title: 'Elektrik Elektronik Mühendisi',
    status: getRandomStatus([
      'in_meeting',
      'busy',
      'working_on_site',
      'on_business_trip',
      'in_another_department',
      'available',
    ]),
  },
  {
    id: 107,
    name: 'Hilal Çelik',
    title: 'Yönetici',
    status: getRandomStatus([
      'in_meeting',
      'busy',
      'working_on_site',
      'on_business_trip',
      'in_another_department',
      'available',
    ]),
  },
  {
    id: 108,
    name: 'İsmail Koç',
    title: 'Müdür',
    status: getRandomStatus([
      'in_meeting',
      'busy',
      'working_on_site',
      'on_business_trip',
      'in_another_department',
      'available',
    ]),
  },
  {
    id: 109,
    name: 'Jale Erdem',
    title: 'Kıdemli Müdür',
    status: getRandomStatus([
      'in_meeting',
      'busy',
      'working_on_site',
      'on_business_trip',
      'in_another_department',
      'available',
    ]),
  },
  {
    id: 110,
    name: 'Kerem Kaya',
    title: 'Teknik Ressam Uzmanı',
    status: getRandomStatus([
      'in_meeting',
      'busy',
      'working_on_site',
      'on_business_trip',
      'in_another_department',
      'available',
    ]),
  },
];
