// src/app/SanalHat/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
// Component import yollarının projenizin yapısına göre doğru olduğundan emin olun
import ShelfCard from '../../components/ShelfCard';

import GarageUnitCard from '../../components/GarageUnitCard';
import GarageDoorCard from '../../components/GarageDoorCard';
import VehicleCard from '../../components/VehicleCard';
import WorkLineCard from '../../components/WorkLineCard'; // WorkLine için kullanılacak

// Tipleri merkezi types.ts dosyasından import ediyoruz
import {
  Shelf,
  GarageUnit,
  GarageDoor,
  Vehicle,
  Personnel,
  LabTable,
  BatterySpotWelder,
  BatteryControlUnit,
  WorkLine,
  ChargeDischargeLine,
  MaterialCabinet,
  ShelfItem,
  PersonnelStatus,
  BatteryModel,
} from '../types';

// Dummy verileri data.ts dosyasından TEK BİR BLOK halinde import ediyoruz.
import {
  garageUnits as initialGarageUnits,
  garageSideShelf as initialGarageSideShelf,
  garageDoor as initialGarageDoor,
  vehicles as initialVehicles,
  batterySectionManager as initialBatterySectionManager,
  elabManager as initialElabManager,
  elabStatus as initialElabStatus,
  batterySectionStatus as initialBatterySectionStatus,
  batteryLabTables as initialBatteryLabTables,
  generalShelves as initialGeneralShelves,
  dcEnergyLabTable as initialDcEnergyLabTable,
  workLines as initialWorkLines,
  monitorStationStatus as initialMonitorStationStatus,
  batteryLabTables2ndRoom as initialBatteryLabTables2ndRoom,
  batterySpotWelder as initialBatterySpotWelder,
  batteryControlUnit as initialBatteryControlUnit,
  chargeDischargeLines as initialChargeDischargeLines,
  warehouseShelves as initialWarehouseShelves,
  materialCabinet as initialMaterialCabinet,
  nonBusProjectShelves as initialNonBusProjectShelves,
  upperFloorPersonnel as initialUpperFloorPersonnel,
} from '../data';

// Yardımcı fonksiyonlar (dinamik güncellemeler için burada da tanımlandı)
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
    id: `item-${Math.random().toString(36).substring(2, 9)}`,
    name: items[getRandomInt(0, items.length - 1)],
    quantity: getRandomInt(1, 50),
    criticalLevel: Math.random() > 0.85,
  }));
};

const getRandomBatteryModel = (): BatteryModel => {
  const models: BatteryModel[] = ['TRESS 35', 'TRESS 48', 'TRESS 75', 'TRESS 102'];
  return models[getRandomInt(0, models.length - 1)];
};

// Raf detayı modalı için basit bir örnek
const ItemDetailModal: React.FC<{ items: ShelfItem[]; onClose: () => void }> = ({
  items,
  onClose,
}) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Bölme İçeriği</h3>
        {items.length > 0 ? (
          <ul className="list-disc list-inside space-y-1">
            {items.map((item) => (
              <li key={item.id} className="text-base text-gray-700">
                {item.name}: <span className="font-semibold">{item.quantity}</span> adet{' '}
                {item.criticalLevel && (
                  <span className="text-red-600 font-semibold ml-1">⚠️ Kritik!</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 italic text-base">Bu bölme boş.</p>
        )}
        <button
          onClick={onClose}
          className="mt-6 w-full px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
        >
          Kapat
        </button>
      </div>
    </div>
  );
};

// --- Ana Sanal Üretim Sayfası Bileşeni ---
export default function VirtualProductionPage() {
  // Tüm verileri state olarak yönetiyoruz ki dinamik olarak güncelleyebilelim
  const [currentGarageUnits, setCurrentGarageUnits] = useState<GarageUnit[]>(initialGarageUnits);
  const [currentGarageSideShelf] = useState<Shelf>(initialGarageSideShelf);
  const [currentGarageDoor, setCurrentGarageDoor] = useState<GarageDoor>(initialGarageDoor);
  const [currentVehicles] = useState<Vehicle[]>(initialVehicles);
  const [currentBatterySectionManager] = useState<Personnel>(initialBatterySectionManager);
  const [currentElabManager] = useState<Personnel>(initialElabManager);
  const [currentElabStatus] = useState<string>(initialElabStatus);
  const [currentBatterySectionStatus] = useState<string>(initialBatterySectionStatus);
  const [currentBatteryLabTables] = useState<LabTable[]>(initialBatteryLabTables);
  const [currentGeneralShelves, setCurrentGeneralShelves] =
    useState<Shelf[]>(initialGeneralShelves);
  const [currentDcEnergyLabTable] = useState<LabTable>(initialDcEnergyLabTable);
  const [currentWorkLines, setCurrentWorkLines] = useState<WorkLine[]>(initialWorkLines);
  const [currentMonitorStationStatus] = useState<string>(initialMonitorStationStatus);
  const [currentBatteryLabTables2ndRoom] = useState<LabTable[]>(initialBatteryLabTables2ndRoom);
  const [currentBatterySpotWelder] = useState<BatterySpotWelder>(initialBatterySpotWelder);
  const [currentBatteryControlUnit] = useState<BatteryControlUnit>(initialBatteryControlUnit);
  const [currentChargeDischargeLines, setCurrentChargeDischargeLines] = useState<
    ChargeDischargeLine[]
  >(initialChargeDischargeLines);
  const [currentWarehouseShelves, setCurrentWarehouseShelves] =
    useState<Shelf[]>(initialWarehouseShelves);
  const [currentMaterialCabinet, setCurrentMaterialCabinet] =
    useState<MaterialCabinet>(initialMaterialCabinet);
  const [currentNonBusProjectShelves, setCurrentNonBusProjectShelves] = useState<Shelf[]>(
    initialNonBusProjectShelves,
  );
  const [currentUpperFloorPersonnel, setCurrentUpperFloorPersonnel] = useState<Personnel[]>(
    initialUpperFloorPersonnel,
  );

  // Modal durumları
  const [showShelfModal, setShowShelfModal] = useState<ShelfItem[] | null>(null);
  const [showMaterialCabinetModal, setShowMaterialCabinetModal] = useState<ShelfItem[] | null>(
    null,
  );
  const [showNonBusShelfModal, setShowNonBusShelfModal] = useState<ShelfItem[] | null>(null);

  // Veri alınamıyor durumları (simülasyon için)
  const [isGlobalDataUnavailable, setIsGlobalDataUnavailable] = useState(false);
  const [isGarageDataUnavailable, setIsGarageDataUnavailable] = useState(false);
  const [isBatterySectionDataUnavailable, setIsBatterySectionDataUnavailable] = useState(false);

  // GÖRÜNÜM MODU STATE'İ
  type ViewMode =
    | 'overview'
    | 'outdoor_area'
    | 'battery_room_1'
    | 'e_lab'
    | 'general_shelves'
    | 'work_lines'
    | 'battery_room_2'
    | 'warehouse_area'
    | 'upper_floor_offices';
  const [currentView, setCurrentView] = useState<ViewMode>('overview');

  // Simülasyon Veri Güncelleme Mantığı (Her 3 saniyede bir)
  useEffect(() => {
    const interval = setInterval(() => {
      // Rastgele data unavailable durumu güncellemesi
      setIsGlobalDataUnavailable(Math.random() > 0.95);
      setIsGarageDataUnavailable(Math.random() > 0.9);
      setIsBatterySectionDataUnavailable(Math.random() > 0.85);

      // Verileri rastgele güncelleme
      setCurrentGarageUnits((prev) =>
        prev.map((unit) => ({
          ...unit,
          status: getRandomStatus(['full', 'active_work', 'empty']),
        })),
      );

      setCurrentWorkLines((prev) =>
        prev.map((line) => {
          if (line.status === 'working') {
            const newProgress = line.progress + getRandomInt(5, 15);
            return {
              ...line,
              progress: newProgress > 100 ? 0 : newProgress,
              currentBatteryModel:
                newProgress > 100 ? getRandomBatteryModel() : line.currentBatteryModel,
            };
          } else if (line.status === 'idle') {
            // idle'dan working'e geçişi de tetikleyelim
            if (Math.random() > 0.8) {
              // %20 ihtimalle idle'dan working'e geçsin
              return {
                ...line,
                status: 'working',
                progress: getRandomInt(5, 20), // Yeni bir ilerleme başlat
                currentBatteryModel: getRandomBatteryModel(),
              };
            }
          }
          return { ...line, progress: 0 }; // Durdurulduysa veya arızalıysa ilerleme sıfır
        }),
      );

      setCurrentChargeDischargeLines((prev) =>
        prev.map((line) => {
          const newBatteries = line.batteries.map((bat) => {
            const newCompletedCycles = bat.completedCycles + 1;
            const newCycleDuration = bat.cycleDurationMinutes + getRandomInt(1, 5);
            const newStatus = newCompletedCycles >= bat.targetCycles ? 'finished' : bat.status; // Batarya cycle bittiyse finished
            return {
              ...bat,
              completedCycles: newCompletedCycles,
              cycleDurationMinutes: newCycleDuration,
              status: newStatus,
            };
          });
          return {
            ...line,
            status: newBatteries.some((b) => b.status === 'charging' || b.status === 'discharging')
              ? line.status
              : 'idle',
            batteries: newBatteries,
          };
        }),
      );

      setCurrentUpperFloorPersonnel((prev) =>
        prev.map((person) => ({
          ...person,
          status: getRandomStatus<PersonnelStatus>([
            'in_meeting',
            'busy',
            'working_on_site',
            'on_business_trip',
            'in_another_department',
            'available',
          ]),
        })),
      );

      setCurrentMaterialCabinet((prev) => ({
        ...prev,
        sections: prev.sections.map((section) => ({
          ...section,
          items: getRandomItems(getRandomInt(0, 2)),
        })),
      }));
      setCurrentGeneralShelves((prev) =>
        prev.map((shelf) => ({
          ...shelf,
          sections: shelf.sections.map((section) => ({
            ...section,
            items: getRandomItems(getRandomInt(0, 4)),
            isEmpty: Math.random() > 0.8,
          })),
          critical: Math.random() > 0.6,
        })),
      );
      setCurrentWarehouseShelves((prev) =>
        prev.map((shelf) => ({
          ...shelf,
          sections: shelf.sections.map((section) => ({
            ...section,
            items: getRandomItems(getRandomInt(0, 5)),
            isEmpty: Math.random() > 0.7,
          })),
          critical: Math.random() > 0.5,
        })),
      );
      setCurrentNonBusProjectShelves((prev) =>
        prev.map((shelf) => ({
          ...shelf,
          sections: shelf.sections.map((section) => ({
            ...section,
            items: getRandomItems(getRandomInt(0, 3)),
            isEmpty: Math.random() > 0.6,
          })),
          critical: Math.random() > 0.4,
        })),
      );
    }, 3000); // Her 3 saniyede bir güncelle

    return () => clearInterval(interval);
  }, []);

  const handleWorkLineStatusToggle = useCallback((id: number) => {
    setCurrentWorkLines((prevLines) =>
      prevLines.map(
        (line) =>
          line.id === id
            ? {
                ...line,
                status: line.status === 'working' ? 'paused' : 'working',
                progress: line.status === 'working' ? 0 : line.progress,
              }
            : line,
        id,
      ),
    );
  }, []);

  const handleGarageDoorStatusToggle = useCallback(() => {
    setCurrentGarageDoor((prevDoor) => ({
      ...prevDoor,
      status: prevDoor.status === 'open' ? 'closed' : 'open',
    }));
  }, []);

  // SVG'nin genel genişlik ve yükseklik ayarları (Excalidraw oranlarına daha yakın)
  const svgWidth = 1400;
  const svgHeight = 980;

  // --- Koşullu Render Mantığı ---
  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return (
          // GENEL BAKIŞ HARİTASI
          <div
            className="border-2 border-gray-300 shadow-2xl bg-white relative rounded-xl overflow-hidden"
            style={{ width: svgWidth, height: svgHeight }}
          >
            <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
              {/* Genel fabrika zeminini temsil eden dikdörtgen */}
              <rect
                x="0"
                y="0"
                width={svgWidth}
                height={svgHeight}
                fill="#fcfcfc"
                stroke="#e0e0e0"
                strokeWidth="1"
                rx="10"
                ry="10"
              />

              {/* Dış Alan */}
              <rect
                x="10"
                y="10"
                width="470"
                height="560"
                fill="#e8f5e9"
                stroke="#a5d6a7"
                strokeWidth="1.5"
                rx="8"
                ry="8"
                cursor="pointer"
                onClick={() => setCurrentView('outdoor_area')}
              />
              <text
                x="25"
                y="40"
                fontSize="20"
                fontWeight="bold"
                fill="#388e3c"
                style={{ pointerEvents: 'none' }}
              >
                Dış Alan 🏞️
              </text>

              {/* Garaj Üniteleri */}
              <foreignObject x="25" y="60" width="160" height="130">
                <GarageUnitCard
                  unit={currentGarageUnits[0]}
                  dataUnavailable={isGarageDataUnavailable}
                />
              </foreignObject>
              <foreignObject x="210" y="60" width="160" height="130">
                <GarageUnitCard
                  unit={currentGarageUnits[1]}
                  dataUnavailable={isGarageDataUnavailable}
                />
              </foreignObject>

              {/* Garaj Yanı Raf */}
              <foreignObject x="25" y="135" width="345" height="350">
                <ShelfCard
                  shelf={currentGarageSideShelf}
                  dataUnavailable={isGarageDataUnavailable}
                  onShelfClick={(items) => setShowShelfModal(items)}
                />
              </foreignObject>

              {/* Araçlar */}
              <foreignObject x="25" y="455" width="130" height="90">
                <VehicleCard
                  vehicle={currentVehicles[0]}
                  dataUnavailable={isGarageDataUnavailable}
                />
              </foreignObject>
              <foreignObject x="210" y="455" width="130" height="90">
                <VehicleCard
                  vehicle={currentVehicles[1]}
                  dataUnavailable={isGarageDataUnavailable}
                />
              </foreignObject>

              {/* Garaj Kapısı */}
              <foreignObject x="395" y="150" width="85" height="150">
                <GarageDoorCard
                  door={currentGarageDoor}
                  dataUnavailable={isGarageDataUnavailable}
                  onToggleStatus={handleGarageDoorStatusToggle}
                />
              </foreignObject>

              {/* Batarya Bölümü */}
              <rect
                x="490"
                y="10"
                width="380"
                height="200"
                fill="#e3f2fd"
                stroke="#90caf9"
                strokeWidth="1.5"
                rx="8"
                ry="8"
                cursor="pointer"
                onClick={() => setCurrentView('battery_room_1')}
              />
              <text
                x="495"
                y="25"
                fontSize="16"
                fontWeight="bold"
                fill="#2196f3"
                style={{ pointerEvents: 'none' }}
              >
                Batarya Bölümü 🔋
              </text>
              <foreignObject x="495" y="25" width="360" height="250">
                <div
                  className="p-2 space-y-2 text-sm text-gray-700"
                  style={{ pointerEvents: 'none' }}
                >
                  <p className="font-semibold">
                    Yönetici: {currentBatterySectionManager.name}{' '}
                    <span className="font-normal italic">
                      ({currentBatterySectionManager.status.replace(/_/g, ' ')})
                    </span>
                  </p>
                  {isBatterySectionDataUnavailable && (
                    <p className="text-red-700 text-xs font-semibold">Veri Alınamıyor!</p>
                  )}
                  <p>
                    Genel Durum:{' '}
                    <span className="font-medium">
                      {currentBatterySectionStatus.replace(/_/g, ' ')}
                    </span>
                  </p>
                  <h5 className="font-semibold mt-2">Masalar:</h5>
                  <div className="grid grid-cols-3 gap-2">
                    {currentBatteryLabTables.map((table) => (
                      <div
                        key={table.id}
                        className={`p-1 rounded text-xs border ${table.status === 'in_use' || table.status === 'working' ? 'bg-orange-100' : 'bg-green-100'}`}
                      >
                        {table.name} <br /> ({table.status})
                      </div>
                    ))}
                  </div>
                </div>
              </foreignObject>

              {/* E-Lab */}
              <rect
                x="875"
                y="10"
                width="300"
                height="200"
                fill="#fffde7"
                stroke="#ffeb3b"
                strokeWidth="1.5"
                rx="8"
                ry="8"
                cursor="pointer"
                onClick={() => setCurrentView('e_lab')}
              />
              <text
                x="899"
                y="25"
                fontSize="16"
                fontWeight="bold"
                fill="#ffc107"
                style={{ pointerEvents: 'none' }}
              >
                E-Lab ⚡
              </text>
              <foreignObject x="899" y="45" width="260" height="150">
                <div
                  className="p-2 space-y-2 text-sm text-gray-700"
                  style={{ pointerEvents: 'none' }}
                >
                  <p className="font-semibold">
                    Yönetici: {currentElabManager.name}{' '}
                    <span className="font-normal italic">
                      ({currentElabManager.status.replace(/_/g, ' ')})
                    </span>
                  </p>
                  {isGlobalDataUnavailable && (
                    <p className="text-red-700 text-xs font-semibold">Veri Alınamıyor!</p>
                  )}
                  <p>
                    Genel Durum:{' '}
                    <span className="font-medium">{currentElabStatus.replace(/_/g, ' ')}</span>
                  </p>
                  <div className="mt-3 text-xs border p-2 rounded bg-white shadow-sm">
                    <h5 className="font-semibold mb-1">DC Enerji Masası:</h5>
                    <p>
                      {currentDcEnergyLabTable.name}:{' '}
                      <span className="font-medium">{currentDcEnergyLabTable.status}</span>
                    </p>
                  </div>
                </div>
              </foreignObject>

              {/* Genel Raflar */}
              <rect
                x="1180"
                y="10"
                width="210"
                height="345"
                fill="#f5f5f5"
                stroke="#9e9e9e"
                strokeWidth="1.5"
                rx="8"
                ry="8"
                cursor="pointer"
                onClick={() => setCurrentView('general_shelves')}
              />
              <text
                x="1195"
                y="25"
                fontSize="16"
                fontWeight="bold"
                fill="#616161"
                style={{ pointerEvents: 'none' }}
              >
                Genel Raflar 📦
              </text>
              <foreignObject x="1190" y="45" width="190" height="300">
                <div className="grid grid-cols-1 gap-2 p-1" style={{ pointerEvents: 'none' }}>
                  {currentGeneralShelves.slice(0, 3).map(
                    (
                      shelf, // Sadece ilk 3 rafı sığdırmak için
                    ) => (
                      <ShelfCard
                        key={shelf.id}
                        shelf={shelf}
                        dataUnavailable={isGlobalDataUnavailable}
                        onShelfClick={(items) => setShowShelfModal(items)}
                      />
                    ),
                  )}
                </div>
              </foreignObject>

              {/* Batarya Çalışma Hatları */}
              <rect
                x="490"
                y="210"
                width="685"
                height="145"
                fill="#e8f5e9"
                stroke="#a5d6a7"
                strokeWidth="1.5"
                rx="8"
                ry="8"
                cursor="pointer"
                onClick={() => setCurrentView('work_lines')}
              />
              <text
                x="735"
                y="285"
                fontSize="16"
                fontWeight="bold"
                fill="#388e3c"
                style={{ pointerEvents: 'none' }}
              >
                Çalışma Hatları 🛠️
              </text>
              <foreignObject x="370" y="225" width="870" height="120">
                <div
                  className="flex gap-4 p-2 justify-around items-center h-full"
                  style={{ pointerEvents: 'none' }}
                >
                  {currentWorkLines.map((line) => (
                    <WorkLineCard // WorkLineCard kullanılıyor
                      key={line.id}
                      line={line}
                      dataUnavailable={isGlobalDataUnavailable}
                      onToggleStatus={handleWorkLineStatusToggle}
                    />
                  ))}
                </div>
              </foreignObject>

              {/* Batarya Bölümü 2. Oda ve Şarj/Deşarj Alanı */}
              <rect
                x="490"
                y="360"
                width="890"
                height="350"
                fill="#e0e0ff"
                stroke="#9fa8da"
                strokeWidth="1.5"
                rx="8"
                ry="8"
                cursor="pointer"
                onClick={() => setCurrentView('battery_room_2')}
              />
              <text
                x="495"
                y="615"
                fontSize="16"
                fontWeight="bold"
                fill="#5c6bc0"
                style={{ pointerEvents: 'none' }}
              >
                Batarya Bölümü - 2. Oda 🚪
              </text>

              {/* Monitör, Punta, Kontrol Ünitesi ve Lab Masaları */}
              <foreignObject x="490" y="365" width="280" height="350">
                <div
                  className="p-2 space-y-2 text-sm text-gray-700"
                  style={{ pointerEvents: 'none' }}
                >
                  <h4 className="font-semibold mb-1">Cihaz Detayları</h4>
                  <p className="text-xs bg-white p-1 rounded shadow-sm">
                    Monitör Masası:{' '}
                    <span className="font-medium">{currentMonitorStationStatus}</span>
                  </p>
                  <p className="text-xs bg-white p-1 rounded shadow-sm">
                    Pil Punta Makinası:{' '}
                    <span className="font-medium">{currentBatterySpotWelder.status}</span>
                  </p>
                  <p className="text-xs bg-white p-1 rounded shadow-sm">
                    Batarya Kontrol Ünitesi:{' '}
                    <span className="font-medium">{currentBatteryControlUnit.status}</span>
                  </p>
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    {currentBatteryLabTables2ndRoom.map((table) => (
                      <div
                        key={table.id}
                        className="text-[10px] border p-1 rounded bg-white shadow-sm"
                      >
                        {table.name} ({table.status})
                      </div>
                    ))}
                  </div>
                  {isBatterySectionDataUnavailable && (
                    <p className="text-red-700 text-xs font-semibold mt-1">Veri Yok!</p>
                  )}
                </div>
              </foreignObject>

              {/* Şarj/Deşarj Alanı */}
              <foreignObject x="790" y="365" width="580" height="370">
                <div
                  className="p-2 space-y-2 text-sm text-gray-700"
                  style={{ pointerEvents: 'none' }}
                >
                  <h4 className="font-semibold mb-1">Şarj/Deşarj Hatları ⚡</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {currentChargeDischargeLines.map((line) => (
                      <div
                        key={line.id}
                        className={`text-xs border p-2 rounded bg-white shadow-sm ${line.status !== 'idle' ? 'bg-purple-100' : ''}`}
                      >
                        <h5 className="font-semibold mb-1">{line.name}</h5>
                        <p>
                          Durum: <span className="font-medium">{line.status}</span>
                        </p>
                        <p>
                          Toplam Batarya:{' '}
                          <span className="font-medium">{line.totalBatteriesInLine}</span>
                        </p>
                        {line.batteries.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {line.batteries.map((bat) => (
                              <div key={bat.id} className="text-[10px] bg-gray-50 p-1 rounded">
                                <p>
                                  Model: {bat.model} / {bat.completedCycles}/{bat.targetCycles} (
                                  {bat.cycleDurationMinutes}dk) |{' '}
                                  <span className="font-semibold">{bat.status}</span>
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                        {isBatterySectionDataUnavailable && (
                          <p className="text-red-700 text-xs font-semibold mt-1">Veri Yok!</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </foreignObject>

              {/* Depo Alanı (Ambar) */}
              <rect
                x="10"
                y="580"
                width="470"
                height="390"
                fill="#fff8e1"
                stroke="#ffcc80"
                strokeWidth="1.5"
                rx="8"
                ry="8"
                cursor="pointer"
                onClick={() => setCurrentView('warehouse_area')}
              />
              <text
                x="25"
                y="605"
                fontSize="18"
                fontWeight="bold"
                fill="#ff9800"
                style={{ pointerEvents: 'none' }}
              >
                Depo Alanı (Ambar) 📦
              </text>
              {/* Ambar Rafları */}
              <foreignObject x="20" y="615" width="220" height="350">
                <div className="grid grid-cols-1 gap-2 p-1" style={{ pointerEvents: 'none' }}>
                  {currentWarehouseShelves.slice(0, 3).map(
                    (
                      shelf, // İlk 3'ü sığdırmak için
                    ) => (
                      <ShelfCard
                        key={shelf.id}
                        shelf={shelf}
                        dataUnavailable={isGlobalDataUnavailable}
                        onShelfClick={(items) => setShowShelfModal(items)}
                      />
                    ),
                  )}
                </div>
              </foreignObject>
              {/* Malzeme Dolabı */}
              <foreignObject x="250" y="615" width="220" height="80">
                <div
                  className="bg-white p-2 rounded text-xs border shadow-sm text-gray-700"
                  style={{ pointerEvents: 'none' }}
                >
                  <h5 className="font-semibold">{currentMaterialCabinet.name}</h5>
                  <p className="text-[10px]">
                    Bölme Sayısı:{' '}
                    <span className="font-medium">{currentMaterialCabinet.sections.length}</span>
                  </p>
                  <button
                    onClick={() =>
                      setShowMaterialCabinetModal(
                        currentMaterialCabinet.sections.flatMap((s) => s.items),
                      )
                    }
                    className="mt-1 px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  >
                    Detay Gör
                  </button>
                  {isGlobalDataUnavailable && (
                    <p className="text-red-700 text-xs mt-1 font-semibold">Veri Yok!</p>
                  )}
                </div>
              </foreignObject>
              {/* Non-Bus Proje Malzemeleri */}
              <foreignObject x="250" y="695" width="220" height="270">
                <div className="grid grid-cols-1 gap-2 p-1" style={{ pointerEvents: 'none' }}>
                  {currentNonBusProjectShelves.slice(0, 1).map(
                    (
                      shelf, // İlk 1'i sığdırmak için
                    ) => (
                      <ShelfCard
                        key={shelf.id}
                        shelf={shelf}
                        dataUnavailable={isGlobalDataUnavailable}
                        onShelfClick={(items) => setShowNonBusShelfModal(items)}
                      />
                    ),
                  )}
                </div>
              </foreignObject>

              {/* Üst Kat (Ofisler) */}
              <rect
                x="490"
                y="720"
                width="890"
                height="250"
                fill="#e1f5fe"
                stroke="#81d4fa"
                strokeWidth="1.5"
                rx="8"
                ry="8"
                cursor="pointer"
                onClick={() => setCurrentView('upper_floor_offices')}
              />
              <text
                x="505"
                y="745"
                fontSize="18"
                fontWeight="bold"
                fill="#03a9f4"
                style={{ pointerEvents: 'none' }}
              >
                Üst Kat (Ofisler) 🏢
              </text>
              <foreignObject x="500" y="755" width="870" height="200">
                <div
                  className="grid grid-cols-4 gap-2 p-2 text-gray-700"
                  style={{ pointerEvents: 'none' }}
                >
                  {currentUpperFloorPersonnel.map((person) => (
                    <div
                      key={person.id}
                      className={`text-xs border p-1 rounded bg-white shadow-sm
                                                 ${isGlobalDataUnavailable ? 'opacity-50 grayscale' : ''}`}
                    >
                      <p className="font-semibold">{person.name}</p>
                      <p className="text-gray-600">{person.title}</p>
                      <p className="font-medium text-blue-700">
                        Durum:{' '}
                        {person.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </p>
                      {isGlobalDataUnavailable && (
                        <p className="text-red-700 text-xs mt-1 font-semibold">Veri Yok!</p>
                      )}
                    </div>
                  ))}
                </div>
              </foreignObject>
            </svg>
          </div>
        );

      case 'outdoor_area':
        return (
          // DIŞ ALAN DETAY GÖRÜNÜMÜ
          <div className="w-full h-full p-8 bg-gray-100 rounded-xl shadow-2xl flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-6 text-green-700">Dış Alan Detayı 🏞️</h2>
            <button
              onClick={() => setCurrentView('overview')}
              className="mb-8 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              ← Genel Haritaya Dön
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-4xl">
              <div className="col-span-full text-center text-lg font-semibold text-gray-700 mb-4">
                Garaj Üniteleri
              </div>
              {currentGarageUnits.map((unit) => (
                <GarageUnitCard
                  key={unit.id}
                  unit={unit}
                  dataUnavailable={isGarageDataUnavailable}
                />
              ))}

              <div className="col-span-full text-center text-lg font-semibold text-gray-700 mt-8 mb-4">
                Garaj Kapısı
              </div>
              <div className="col-span-full flex justify-center">
                <GarageDoorCard
                  door={currentGarageDoor}
                  dataUnavailable={isGarageDataUnavailable}
                  onToggleStatus={handleGarageDoorStatusToggle}
                />
              </div>

              <div className="col-span-full text-center text-lg font-semibold text-gray-700 mt-8 mb-4">
                Garaj Yanı Raf
              </div>
              <div className="col-span-full flex justify-center">
                <ShelfCard
                  shelf={currentGarageSideShelf}
                  dataUnavailable={isGarageDataUnavailable}
                  onShelfClick={(items) => setShowShelfModal(items)}
                />
              </div>

              <div className="col-span-full text-center text-lg font-semibold text-gray-700 mt-8 mb-4">
                Araçlar
              </div>
              {currentVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  dataUnavailable={isGarageDataUnavailable}
                />
              ))}
            </div>
          </div>
        );

      case 'battery_room_1':
        return (
          // BATARYA BÖLÜMÜ (İLK ODA) DETAY GÖRÜNÜMÜ
          <div className="w-full h-full p-8 bg-blue-50 rounded-xl shadow-2xl flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-6 text-blue-800">Batarya Bölümü Detayı 🔋</h2>
            <button
              onClick={() => setCurrentView('overview')}
              className="mb-8 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              ← Genel Haritaya Dön
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
              <div className="md:col-span-full text-center text-lg font-semibold text-gray-700 mb-4">
                Genel Durum ve Yönetici
              </div>
              <div className="bg-white p-4 rounded-lg shadow col-span-full">
                <h4 className="font-semibold text-blue-700 mb-2">Batarya Bölümü Yönetici</h4>
                <p>
                  Ad: <span className="font-medium">{currentBatterySectionManager.name}</span>
                </p>
                <p>
                  Unvan: <span className="font-medium">{currentBatterySectionManager.title}</span>
                </p>
                <p>
                  Durum:{' '}
                  <span className="font-medium">
                    {currentBatterySectionManager.status.replace(/_/g, ' ')}
                  </span>
                </p>
                {isBatterySectionDataUnavailable && (
                  <p className="text-red-700 text-xs font-semibold mt-2">Veri Alınamıyor!</p>
                )}
              </div>

              <div className="md:col-span-full text-center text-lg font-semibold text-gray-700 mt-8 mb-4">
                Laboratuvar Masaları
              </div>
              {currentBatteryLabTables.map((table) => (
                <div
                  key={table.id}
                  className={`p-4 rounded-lg shadow border border-blue-100 ${table.status === 'in_use' || table.status === 'working' ? 'bg-orange-100' : 'bg-green-100'}`}
                >
                  <p className="font-semibold">{table.name}</p>
                  <p>
                    Durum: <span className="font-medium">{table.status}</span>
                  </p>
                  {table.type === 'production_engineer' && (
                    <p className="text-xs text-gray-500">(Üretim Mühendisi)</p>
                  )}
                  {isBatterySectionDataUnavailable && (
                    <p className="text-red-700 text-xs font-semibold mt-2">Veri Alınamıyor!</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'e_lab':
        return (
          <div className="w-full h-full p-8 bg-yellow-50 rounded-xl shadow-2xl flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-6 text-yellow-800">E-Lab Detayı ⚡</h2>
            <button
              onClick={() => setCurrentView('overview')}
              className="mb-8 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              ← Genel Haritaya Dön
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              <div className="col-span-full text-center text-lg font-semibold text-gray-700 mb-4">
                Genel Durum ve Yönetici
              </div>
              <div className="bg-white p-4 rounded-lg shadow col-span-full">
                <h4 className="font-semibold text-yellow-700 mb-2">E-Lab Yöneticisi</h4>
                <p>
                  Ad: <span className="font-medium">{currentElabManager.name}</span>
                </p>
                <p>
                  Unvan: <span className="font-medium">{currentElabManager.title}</span>
                </p>
                <p>
                  Durum:{' '}
                  <span className="font-medium">
                    {currentElabManager.status.replace(/_/g, ' ')}
                  </span>
                </p>
                {isGlobalDataUnavailable && (
                  <p className="text-red-700 text-xs font-semibold mt-2">Veri Alınamıyor!</p>
                )}
              </div>
              <div className="col-span-full text-center text-lg font-semibold text-gray-700 mt-8 mb-4">
                DC Enerji Masası
              </div>
              <div className="bg-white p-4 rounded-lg shadow col-span-full">
                <h4 className="font-semibold text-yellow-700 mb-2">
                  Ayarlanabilir DC Enerji Masası
                </h4>
                <p>
                  Durum: <span className="font-medium">{currentDcEnergyLabTable.status}</span>
                </p>
                {isGlobalDataUnavailable && (
                  <p className="text-red-700 text-xs font-semibold mt-2">Veri Alınamıyor!</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'general_shelves':
        return (
          <div className="w-full h-full p-8 bg-gray-100 rounded-xl shadow-2xl flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Genel Raflar Detayı 📦</h2>
            <button
              onClick={() => setCurrentView('overview')}
              className="mb-8 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              ← Genel Haritaya Dön
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
              {currentGeneralShelves.map((shelf) => (
                <ShelfCard
                  key={shelf.id}
                  shelf={shelf}
                  dataUnavailable={isGlobalDataUnavailable}
                  onShelfClick={(items) => setShowShelfModal(items)}
                />
              ))}
            </div>
          </div>
        );

      case 'work_lines':
        return (
          <div className="w-full h-full p-8 bg-green-50 rounded-xl shadow-2xl flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-6 text-green-800">Çalışma Hatları Detayı 🛠️</h2>
            <button
              onClick={() => setCurrentView('overview')}
              className="mb-8 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              ← Genel Haritaya Dön
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl">
              {currentWorkLines.map((line) => (
                <WorkLineCard
                  key={line.id}
                  line={line}
                  dataUnavailable={isGlobalDataUnavailable}
                  onToggleStatus={handleWorkLineStatusToggle}
                />
              ))}
            </div>
          </div>
        );

      case 'battery_room_2':
        return (
          <div className="w-full h-full p-8 bg-indigo-50 rounded-xl shadow-2xl flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-6 text-indigo-800">
              Batarya Bölümü - 2. Oda Detayı 🚪
            </h2>
            <button
              onClick={() => setCurrentView('overview')}
              className="mb-8 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              ← Genel Haritaya Dön
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
              <div className="md:col-span-full text-center text-lg font-semibold text-gray-700 mb-4">
                Cihaz Detayları
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold mb-2">Monitör Masası</h4>
                <p>
                  Durum: <span className="font-medium">{currentMonitorStationStatus}</span>
                </p>
                {isBatterySectionDataUnavailable && (
                  <p className="text-red-700 text-xs font-semibold mt-2">Veri Alınamıyor!</p>
                )}
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold mb-2">Pil Punta Makinası</h4>
                <p>
                  Durum: <span className="font-medium">{currentBatterySpotWelder.status}</span>
                </p>
                {isBatterySectionDataUnavailable && (
                  <p className="text-red-700 text-xs font-semibold mt-2">Veri Alınamıyor!</p>
                )}
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold mb-2">Batarya Kontrol Ünitesi</h4>
                <p>
                  Durum: <span className="font-medium">{currentBatteryControlUnit.status}</span>
                </p>
                {isBatterySectionDataUnavailable && (
                  <p className="text-red-700 text-xs font-semibold mt-2">Veri Alınamıyor!</p>
                )}
              </div>

              <div className="md:col-span-full text-center text-lg font-semibold text-gray-700 mt-8 mb-4">
                Laboratuvar Masaları
              </div>
              {currentBatteryLabTables2ndRoom.map((table) => (
                <div
                  key={table.id}
                  className={`p-4 rounded-lg shadow border border-indigo-100 ${table.status === 'in_use' || table.status === 'faulty' ? 'bg-orange-100' : 'bg-green-100'}`}
                >
                  <p className="font-semibold">{table.name}</p>
                  <p>
                    Durum: <span className="font-medium">{table.status}</span>
                  </p>
                  {isBatterySectionDataUnavailable && (
                    <p className="text-red-700 text-xs font-semibold mt-2">Veri Alınamıyor!</p>
                  )}
                </div>
              ))}

              <div className="md:col-span-full text-center text-lg font-semibold text-gray-700 mt-8 mb-4">
                Şarj/Deşarj Hatları
              </div>
              {currentChargeDischargeLines.map((line) => (
                <div
                  key={line.id}
                  className={`p-4 rounded-lg shadow border border-purple-100 ${line.status !== 'idle' ? 'bg-purple-100' : 'bg-white'}`}
                >
                  <h5 className="font-semibold mb-1">{line.name}</h5>
                  <p>
                    Durum: <span className="font-medium">{line.status}</span>
                  </p>
                  <p>
                    Toplam Batarya: <span className="font-medium">{line.totalBatteriesInLine}</span>
                  </p>
                  {line.batteries.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {line.batteries.map((bat) => (
                        <div key={bat.id} className="text-xs bg-gray-50 p-2 rounded">
                          <p>
                            Model: {bat.model} / {bat.completedCycles}/{bat.targetCycles} (
                            {bat.cycleDurationMinutes}dk) |{' '}
                            <span className="font-semibold">{bat.status}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {isBatterySectionDataUnavailable && (
                    <p className="text-red-700 text-xs font-semibold mt-2">Veri Yok!</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'warehouse_area':
        return (
          <div className="w-full h-full p-8 bg-yellow-50 rounded-xl shadow-2xl flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-6 text-yellow-800">
              Depo Alanı Detayı (Ambar) 📦
            </h2>
            <button
              onClick={() => setCurrentView('overview')}
              className="mb-8 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              ← Genel Haritaya Dön
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
              <div className="md:col-span-full text-center text-lg font-semibold text-gray-700 mb-4">
                Ambar Rafları
              </div>
              {currentWarehouseShelves.map((shelf) => (
                <ShelfCard
                  key={shelf.id}
                  shelf={shelf}
                  dataUnavailable={isGlobalDataUnavailable}
                  onShelfClick={(items) => setShowShelfModal(items)}
                />
              ))}

              <div className="md:col-span-full text-center text-lg font-semibold text-gray-700 mt-8 mb-4">
                Malzeme Dolabı
              </div>
              <div className="bg-white p-6 rounded-lg shadow md:col-span-full">
                <h4 className="font-semibold mb-2">{currentMaterialCabinet.name}</h4>
                <p className="mb-4">
                  Bölme Sayısı:{' '}
                  <span className="font-medium">{currentMaterialCabinet.sections.length}</span>
                </p>
                <button
                  onClick={() =>
                    setShowMaterialCabinetModal(
                      currentMaterialCabinet.sections.flatMap((s) => s.items),
                    )
                  }
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Detay Gör
                </button>
                {isGlobalDataUnavailable && (
                  <p className="text-red-700 text-xs font-semibold mt-2">Veri Yok!</p>
                )}
              </div>

              <div className="md:col-span-full text-center text-lg font-semibold text-gray-700 mt-8 mb-4">
                Non-Bus Proje Malzemeleri
              </div>
              {currentNonBusProjectShelves.map((shelf) => (
                <ShelfCard
                  key={shelf.id}
                  shelf={shelf}
                  dataUnavailable={isGlobalDataUnavailable}
                  onShelfClick={(items) => setShowNonBusShelfModal(items)}
                />
              ))}
            </div>
          </div>
        );

      case 'upper_floor_offices':
        return (
          <div className="w-full h-full p-8 bg-blue-100 rounded-xl shadow-2xl flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-6 text-blue-800">Üst Kat Ofisleri Detayı 🏢</h2>
            <button
              onClick={() => setCurrentView('overview')}
              className="mb-8 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              ← Genel Haritaya Dön
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-6xl">
              {currentUpperFloorPersonnel.map((person) => (
                <div
                  key={person.id}
                  className={`p-4 rounded-lg shadow border border-gray-200 bg-white
                                                 ${isGlobalDataUnavailable ? 'opacity-50 grayscale' : ''}`}
                >
                  <p className="font-semibold">{person.name}</p>
                  <p className="text-gray-600">{person.title}</p>
                  <p className="font-medium text-blue-700">
                    Durum:{' '}
                    {person.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                  {isGlobalDataUnavailable && (
                    <p className="text-red-700 text-xs font-semibold mt-2">Veri Yok!</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen flex flex-col items-center justify-center font-sans text-gray-800">
      {/* Modallar */}
      {showShelfModal && (
        <ItemDetailModal items={showShelfModal} onClose={() => setShowShelfModal(null)} />
      )}
      {showMaterialCabinetModal && (
        <ItemDetailModal
          items={showMaterialCabinetModal}
          onClose={() => setShowMaterialCabinetModal(null)}
        />
      )}
      {showNonBusShelfModal && (
        <ItemDetailModal
          items={showNonBusShelfModal}
          onClose={() => setShowNonBusShelfModal(null)}
        />
      )}
      <h1 className="text-4xl font-extrabold text-center mb-8 tracking-tight text-blue-800 drop-shadow-md">
        🏭 Sanal Üretim Tesisi Haritası
      </h1>
      {renderContent()} {/* Burası artık içeriği viewMode'a göre render edecek */}
    </main>
  );
}
