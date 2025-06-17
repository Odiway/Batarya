// src/types.ts

// Genel Prop: Veri Alınamıyor durumu
export interface DataAvailabilityProps {
  dataUnavailable?: boolean;
}

// Garaj Ünitesi Tipleri
export interface GarageUnit {
  id: number;
  label: string;
  status: 'full' | 'active_work' | 'empty'; // Dışarıdan otobüs geliyorsa vs.
}

// Raf Ünitesi Tipleri (Genel)
export interface ShelfItem {
  id: string; // Ürünün ID'si
  name: string; // Ürünün adı
  quantity: number; // Stok miktarı
  criticalLevel: boolean; // Kritik stok seviyesinde mi?
}

export interface ShelfSection {
  id: number;
  label: string; // Bölme etiketi (Örn: "Bölme 1")
  items: ShelfItem[]; // İçindeki ürünler
  isEmpty: boolean; // Bölme boş mu?
}

export interface Shelf {
  id: number;
  label: string; // Rafın genel etiketi (Örn: "Raf 1")
  sections: ShelfSection[]; // Rafın bölmeleri
  critical: boolean; // Raf genel olarak kritik mi? (En az bir bölümü kritikse)
}

// Garaj Kapısı Tipleri
export interface GarageDoor {
  id: number;
  name: string;
  status: 'open' | 'closed';
}

// Araç Tipleri
export interface Vehicle {
  id: number;
  name: string;
  type: 'golf_car' | 'mini_truck';
  status: 'in_garage' | 'outside';
}

// Personel Tipleri
export type PersonnelStatus =
  | 'in_meeting'
  | 'busy'
  | 'working_on_site'
  | 'on_business_trip'
  | 'in_another_department'
  | 'available'; // 'not_found' durumu yerine dataUnavailable kullanılacak

export interface Personnel {
  id: number;
  name: string;
  title: string;
  status: PersonnelStatus;
}

// Laboratuvar Masası Tipleri
export interface LabTable {
  id: number;
  name: string;
  status: 'empty' | 'in_use' | 'faulty' | 'working' | 'ready';
  type?: 'production_engineer' | 'master' | 'dc_energy';
}

// Pil Punta Makinası Tipleri
export interface BatterySpotWelder {
  id: number;
  name: string;
  status: 'ready' | 'working' | 'faulty';
}

// Batarya Kontrol Ünitesi Tipleri
export interface BatteryControlUnit {
  id: number;
  name: string;
  status: 'working' | 'standby' | 'faulty';
}

// Batarya Modelleri
export type BatteryModel = 'TRESS 35' | 'TRESS 48' | 'TRESS 75' | 'TRESS 102';

// Çalışma Hattı Tipleri (Montaj/Demontaj)
export interface WorkLine {
  id: number;
  name: string;
  status: 'idle' | 'working' | 'faulty' | 'maintenance' | 'paused'; // 'working' veya 'idle' dışında bir durum varsa, bu hat çalışmıyor demektir
  currentBatteryModel?: BatteryModel; // Çalışıyorsa hangi model
  progress: number; // 0-100 arası ilerleme
}

// Şarj/Deşarj Hatları İçin Batarya Detayı
export interface ChargingBatteryDetail {
  id: string; // Bataryanın benzersiz ID'si
  model: BatteryModel;
  targetCycles: number; // Kaç cycle dönmesi gerekiyor
  completedCycles: number; // Şu ana kadar kaç cycle tamamladı
  cycleDurationMinutes: number; // Kaç dakikadır cycleda
  status: 'charging' | 'discharging' | 'finished' | 'error'; // Bataryanın kendi iç durumu
}

// Şarj/Deşarj Hattı Tipleri
export interface ChargeDischargeLine {
  id: number;
  name: string;
  status: 'idle' | 'charging' | 'discharging' | 'faulty' | 'maintenance';
  batteries: ChargingBatteryDetail[]; // Bu hatta işlem gören bataryalar
  totalBatteriesInLine: number; // Bu hatta kaç adet batarya var
}

// Malzeme Dolabı Tipleri
export interface MaterialCabinet {
  id: number;
  name: string;
  sections: { id: number; label: string; items: ShelfItem[] }[]; // Her bölmenin kendine ait ürünleri
}

// Ölçüm Sehpasının orijinal tipi
export interface MeasurementBench {
  id: number;
  name: string;
  status: 'working' | 'idle' | 'error';
  assignedTo?: string;
  lastMeasuredAt?: string;
}
export interface ProductionLine {
  currentBatteryModel: BatteryModel; // Çalışma hattının şu anki batarya modeli
  id: number;
  name: string;
  status: 'active' | 'paused';
  energyConsumption: number;
  operators: string[];
  partsProduced: number;
  progress: number; // Added progress here in previous step, ensure it's there
}

// **CRITICAL FIX: Ensure 'export' is here**
