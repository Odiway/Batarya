// src/app/Depo/page.tsx
'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  Package,
  Search,
  PlusCircle,
  Download,
  Trash2,
  Box,
  AlertTriangle,
  Save,
  UploadCloud,
  FileText,
} from 'lucide-react'; // Lucide icons for visual appeal

// Bu dosyanın client tarafında çalıştığından emin olun (Zaten var)
// import * as XLSX from 'xlsx'; // XLSX kütüphanesi kullanılacaksa import edilmeli

// --- Stok Verisi Tipi ---
type StockItem = {
  id: number;
  name: string; // Parça adı/kodu
  quantity: number; // Mevcut miktar
  minStock: number; // Minimum stok seviyesi (kritik eşik)
  location: string; // Depo konumu (raf, bölme vb.)
  definition: string; // Parçanın tanımı/açıklaması
};

// --- Başlangıç Stok Verileri ---
const initialStock: StockItem[] = [
  {
    id: 1,
    name: '2120-ALH-09Y',
    quantity: 4,
    minStock: 1,
    location: 'Raf A1-B3',
    definition: 'BATARYA KONTROL ÜNİTESİ (BCU)',
  },
  {
    id: 2,
    name: '2120-ALN-01Y',
    quantity: 3,
    minStock: 1,
    location: 'Raf A1-B2',
    definition: 'ÖN ŞARJ KARTI',
  },
  {
    id: 3,
    name: '2120-ALN-06Y',
    quantity: 48,
    minStock: 16,
    location: 'Raf A2-C1',
    definition: 'BATARYA YÖNETİM ÜNİTESİ V2 (BMU)',
  },
  {
    id: 4,
    name: '5122-LFE-03Y',
    quantity: 1,
    minStock: 5,
    location: 'Raf B1-A4',
    definition: 'YAPIŞKAN KROŞE',
  },
  {
    id: 5,
    name: '5500-ALS-02Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf C3-D1',
    definition: 'BATARYA KUTUSU (TÜRK TRAKTÖR)',
  },
  {
    id: 6,
    name: '5572-ALS-02',
    quantity: 1,
    minStock: 176,
    location: 'Raf C3-D2',
    definition: 'AKÜ, NMC, CALB, 115Ah, 3.7V, L221N113',
  },
  {
    id: 7,
    name: '5625-ALP-07Y',
    quantity: 12,
    minStock: 4,
    location: 'Raf A4-B1',
    definition: 'BATARYA İLETİŞİM TESİSATI, LEV',
  },
  {
    id: 8,
    name: '5625-ALP-08Y',
    quantity: 16,
    minStock: 11,
    location: 'Raf A4-B2',
    definition: 'BATARYA İLETİŞİM TESİSATI, LEV',
  },
  {
    id: 9,
    name: '5625-ALP-09Y',
    quantity: 4,
    minStock: 1,
    location: 'Raf A4-B3',
    definition: 'BATARYA İLETİŞİM TESİSATI, LEV',
  },
  {
    id: 10,
    name: '5625-ALP-11Y',
    quantity: 48,
    minStock: 16,
    location: 'Raf A4-B4',
    definition: 'BATARYA İLETİŞİM TESİSATI, LEV',
  },
  {
    id: 11,
    name: '5625-ALS-01Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf A5-C1',
    definition: 'BATARYA İLETİŞİM TESİSATI, LEV',
  },
  {
    id: 12,
    name: '5721-ALL-01Y',
    quantity: 3,
    minStock: 1,
    location: 'Raf A5-C2',
    definition: 'BATARYA AŞIRI BASINÇ VENTİLİ (350mbar)',
  },
  {
    id: 13,
    name: '6908-ANP-01',
    quantity: 1,
    minStock: 8,
    location: 'Raf A5-C3',
    definition: 'BATARYA SOĞUTMA PLAKASI SETİ',
  },
  {
    id: 14,
    name: '6919-ALS-01Y',
    quantity: 1,
    minStock: 2,
    location: 'Raf B2-A1',
    definition: 'BATARYA MODÜLÜ',
  },
  {
    id: 15,
    name: '6919-ALS-02Y',
    quantity: 1,
    minStock: 2,
    location: 'Raf B2-A2',
    definition: 'BATARYA MODÜLÜ',
  },
  {
    id: 16,
    name: '6919-ALS-03Y',
    quantity: 1,
    minStock: 2,
    location: 'Raf B2-A3',
    definition: 'BATARYA MODÜLÜ',
  },
  {
    id: 17,
    name: '6919-ALS-04Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf B2-A4',
    definition: 'BATARYA MODÜLÜ',
  },
  {
    id: 18,
    name: '6919-ALS-05Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf B2-B1',
    definition: 'BATARYA MODÜLÜ',
  },
  {
    id: 19,
    name: '6919-ALS-06Y',
    quantity: 1,
    minStock: 8,
    location: 'Raf B2-B2',
    definition: 'BATARYA MODÜL KAPAĞI',
  },
  {
    id: 20,
    name: '6981-ALS-01Y',
    quantity: 1,
    minStock: 192,
    location: 'Raf B3-C1',
    definition: 'BATARYA İZOLASYON ÇİFT TARAF YAPIŞKANLI',
  },
  {
    id: 21,
    name: '6982-ALR-06Y',
    quantity: 1,
    minStock: 16,
    location: 'Raf B3-C2',
    definition: 'BATARYA TERMAL PAD',
  },
  {
    id: 22,
    name: '6982-ALS-01Y',
    quantity: 1,
    minStock: 32,
    location: 'Raf B3-C3',
    definition: 'BATARYA TERMAL YALITKAN PLAKA',
  },
  {
    id: 23,
    name: '6982-ALS-02Y',
    quantity: 1,
    minStock: 8,
    location: 'Raf B3-C4',
    definition: 'BATARYA TERMAL YALITKAN PLAKA',
  },
  {
    id: 24,
    name: '8160-143Y',
    quantity: 3,
    minStock: 1,
    location: 'Raf C1-D1',
    definition: 'HABERLEŞME GÜRÜLTÜ FİLTRE DONANIMI',
  },
  {
    id: 25,
    name: '8160-157Y',
    quantity: 3,
    minStock: 1,
    location: 'Raf C1-D2',
    definition: 'PTC KARTI',
  },
  {
    id: 26,
    name: '9050-1165Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf C1-D3',
    definition: 'ETİKET, BATARYA',
  },
  {
    id: 27,
    name: '9101-180Y',
    quantity: 1,
    minStock: 4,
    location: 'Raf C2-E1',
    definition: 'CİVATA, FLANŞLI AKB M4x8 5.6K, TIRTILLI',
  },
  {
    id: 28,
    name: '9101-194Y',
    quantity: 1,
    minStock: 168,
    location: 'Raf C2-E2',
    definition: 'M5x8 ISO10642 A2',
  },
  {
    id: 29,
    name: '9101-199Y',
    quantity: 1,
    minStock: 105,
    location: 'Raf C2-E3',
    definition: 'CİVATA, M3x8-5.6 DIN 7985',
  },
  {
    id: 30,
    name: '9101-200Y',
    quantity: 1,
    minStock: 192,
    location: 'Raf C2-E4',
    definition: 'CİVATA, M3x6-5.6 DIN 7985-36-S',
  },
  {
    id: 31,
    name: '9105-66Y',
    quantity: 1,
    minStock: 60,
    location: 'Raf D1-A1',
    definition: 'M8 DIN 25201 KİLİTLEME PULU',
  },
  {
    id: 32,
    name: '9111-104Y',
    quantity: 1,
    minStock: 2,
    location: 'Raf D1-A2',
    definition: 'REKOR, DİRSEK M20X1.5-Ø19',
  },
  {
    id: 33,
    name: '9206-29Y',
    quantity: 1,
    minStock: 2,
    location: 'Raf D1-A3',
    definition: 'CONTA, BATARYA',
  },
  {
    id: 34,
    name: '9206-40Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf D1-A4',
    definition: 'CONTA, BATARYA KUTUSU',
  },
  {
    id: 35,
    name: '9206-41Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf D2-B1',
    definition: 'CONTA, BATARYA KUTUSU',
  },
  {
    id: 36,
    name: '9206-49Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf D2-B2',
    definition: 'YAN KAPAK CONTASI',
  },
  {
    id: 37,
    name: '9324-4480Y',
    quantity: 1,
    minStock: 4,
    location: 'Raf D2-B3',
    definition: 'PLAKA, BARA',
  },
  {
    id: 38,
    name: '9326-10234Y',
    quantity: 1,
    minStock: 8,
    location: 'Raf D2-B4',
    definition: 'BRAKET, BARA',
  },
  {
    id: 39,
    name: '9326-10284Y',
    quantity: 1,
    minStock: 16,
    location: 'Raf E1-C1',
    definition: 'BRAKET, BATARYA',
  },
  {
    id: 40,
    name: '9326-8277Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf E1-C2',
    definition: 'BRAKET, BATARYA KUTUSU',
  },
  {
    id: 41,
    name: '9402-977Y',
    quantity: 12,
    minStock: 2,
    location: 'Raf E1-C3',
    definition: 'KART, BATARYA SOĞUTMA, CONTROLLER',
  },
  {
    id: 42,
    name: '9420-356Y',
    quantity: 3,
    minStock: 1,
    location: 'Raf E1-C4',
    definition: 'MEKANİK GÜÇ KESİCİ, LION BATARYA',
  },
  {
    id: 43,
    name: '9430-31',
    quantity: 3,
    minStock: 1,
    location: 'Raf F1-A1',
    definition: 'PDU AKIM SENSÖRÜ, 1000A',
  },
  {
    id: 44,
    name: '9430-53',
    quantity: 99,
    minStock: 32,
    location: 'Raf F1-A2',
    definition: 'SENSÖR, 1ad 9430-53',
  },
  {
    id: 45,
    name: '9430-54',
    quantity: 3,
    minStock: 1,
    location: 'Raf F1-A3',
    definition: 'NEM SENSÖRÜ',
  },
  {
    id: 46,
    name: '9430-62',
    quantity: 9,
    minStock: 3,
    location: 'Raf F1-A4',
    definition: 'SICAKLIK SENSÖRÜ',
  },
  {
    id: 47,
    name: '9439-50Y',
    quantity: 6,
    minStock: 2,
    location: 'Raf F2-B1',
    definition: 'GIGAVAC 241MAB KONTAKTÖR, 400A 12V 800',
  },
  {
    id: 48,
    name: '9439-51Y',
    quantity: 3,
    minStock: 1,
    location: 'Raf F2-B2',
    definition: 'GLVAC GLF40AB KONTAKTÖR, 40A 14V 800VD',
  },
  {
    id: 49,
    name: '9440-105',
    quantity: 3,
    minStock: 1,
    location: 'Raf F2-B3',
    definition: 'SINOFUSE 175A',
  },
  {
    id: 50,
    name: '9440-106',
    quantity: 3,
    minStock: 1,
    location: 'Raf F2-B4',
    definition: 'SINOFUSE 175A FUSEHOLDER',
  },
  {
    id: 51,
    name: '9454-68Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf G1-C1',
    definition: 'BARA, BATARYA',
  },
  {
    id: 52,
    name: '9454-69Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf G1-C2',
    definition: 'BARA, BATARYA',
  },
  {
    id: 53,
    name: '9454-70Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf G1-C3',
    definition: 'BARA, BATARYA',
  },
  {
    id: 54,
    name: '9454-71Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf G1-C4',
    definition: 'BARA, BATARYA',
  },
  {
    id: 55,
    name: '9454-73Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf G2-D1',
    definition: 'BARA, BATARYA',
  },
  {
    id: 56,
    name: '9454-74Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf G2-D2',
    definition: 'BARA, BATARYA',
  },
  {
    id: 57,
    name: '9454-75Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf G2-D3',
    definition: 'BARA, BATARYA',
  },
  {
    id: 58,
    name: '9454-76Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf G2-D4',
    definition: 'BARA, BATARYA',
  },
  {
    id: 59,
    name: '9454-77Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf H1-A1',
    definition: 'BARA, BATARYA',
  },
  {
    id: 60,
    name: '9454-78Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf H1-A2',
    definition: 'BARA, BATARYA',
  },
  {
    id: 61,
    name: '9454-79Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf H1-A3',
    definition: 'BARA, BATARYA',
  },
  {
    id: 62,
    name: '9454-80Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf H1-A4',
    definition: 'BARA, BATARYA',
  },
  {
    id: 63,
    name: '9454-81Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf I1-B1',
    definition: 'BARA, BATARYA',
  },
  {
    id: 64,
    name: '9454-82Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf I1-B2',
    definition: 'BARA, BATARYA',
  },
  {
    id: 65,
    name: '9454-86Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf I1-B3',
    definition: 'BARA, BATARYA',
  },
  {
    id: 66,
    name: '9460-1247',
    quantity: 1,
    minStock: 1,
    location: 'Raf I1-B4',
    definition: 'KONEKTÖR, PL082X-301-10D10 1000V',
  },
  {
    id: 67,
    name: '9460-1258',
    quantity: 3,
    minStock: 1,
    location: 'Raf J1-C1',
    definition: 'KONEKTÖR DİŞİ 12 PİN TE',
  },
  {
    id: 68,
    name: '9460-1259',
    quantity: 3,
    minStock: 1,
    location: 'Raf J1-C2',
    definition: 'KONEKTÖR KİLİT KIZAĞI TE',
  },
  {
    id: 69,
    name: '9460-992Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf J1-C3',
    definition: 'YÜKSEK VOLTAJ İZOLASYON PARÇASI-M5',
  },
  {
    id: 70,
    name: '9602-1226Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf J1-C4',
    definition: 'SICAK SU BORUSU',
  },
  {
    id: 71,
    name: '9602-1227Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf K1-D1',
    definition: 'SICAK SU BORUSU',
  },
  {
    id: 72,
    name: '9603-110',
    quantity: 1,
    minStock: 1,
    location: 'Raf K1-D2',
    definition: 'SICAK SU HATTI FİTİNG',
  },
  {
    id: 73,
    name: '9603-111',
    quantity: 1,
    minStock: 1,
    location: 'Raf K1-D3',
    definition: 'SICAK SU HATTI FİTİNG',
  },
  {
    id: 74,
    name: '9603-112',
    quantity: 1,
    minStock: 1,
    location: 'Raf K1-D4',
    definition: 'SICAK SU HATTI FİTİNG',
  },
  {
    id: 75,
    name: '9603-113',
    quantity: 1,
    minStock: 1,
    location: 'Raf L1-A1',
    definition: 'SICAK SU HATTI FİTİNG',
  },
  {
    id: 76,
    name: 'BCMD04015A30Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf L1-A2',
    definition: 'CİVATA, Silindir Başlı İmbus/Alyen M4x15x8.8',
  },
  {
    id: 77,
    name: 'BCMD08012B30Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf L1-A3',
    definition: 'CİVATA ALYAN BAŞLI (M8x1.25x12-8.8)',
  },
  {
    id: 78,
    name: 'BCMD08015B30Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf L1-A4',
    definition: 'ALYAN CİVATA (M8x1.25x15-8.8)',
  },
  {
    id: 79,
    name: 'BCMD08025B50Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf M1-B1',
    definition: 'CİVATA ALYAN BAŞLI (M8x1.25x25) 10.9',
  },
  {
    id: 80,
    name: 'BCMF05020A50Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf M1-B2',
    definition: 'CİVATA, M5x08x20',
  },
  {
    id: 81,
    name: 'BSMB10010C31Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf M1-B3',
    definition: 'SOMUN, AKB, FLANŞLI (M10x1.5-8.8)',
  },
  {
    id: 82,
    name: 'BSMS05B10Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf M1-B4',
    definition: 'FİBERLİ SOMUN M5 (DIN 985)',
  },
  {
    id: 83,
    name: 'MA275757Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf N1-C1',
    definition: 'KLİPS (15)',
  },
  {
    id: 84,
    name: 'MF140005Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf N1-C2',
    definition: 'CİVATA AKB FLANŞLI (M6X1X16 4T) K:5.8',
  },
  {
    id: 85,
    name: 'MF140425Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf N1-C3',
    definition: 'CİVATA AKB FLANŞLI (M8x1.25x20) K:8.8',
  },
  {
    id: 86,
    name: 'MF200027Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf N1-C4',
    definition: 'CİVATA AKB FLANŞLI (M8x1.25x20) K:8.8',
  },
  {
    id: 87,
    name: 'MF200050Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf O1-D1',
    definition: 'CİVATA, BOMBE, YILDIZ (A M5x0.8x10-5.6)',
  },
  {
    id: 88,
    name: 'MF200051Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf O1-D2',
    definition: 'CİVATA, BOMBE, YILDIZ (A M5X0.8X12-5.6)',
  },
  {
    id: 89,
    name: 'MF200055Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf O1-D3',
    definition: 'CİVATA, BOMBE, YILDIZ (A M5X0.8X20-5.6)',
  },
  {
    id: 90,
    name: 'MF430004Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf O1-D4',
    definition: 'SOMUN, AKB (M6x1x5) K:4.8',
  },
  {
    id: 91,
    name: 'MF430005KY',
    quantity: 1,
    minStock: 1,
    location: 'Raf P1-A1',
    definition: 'SOMUN, KİLİTLEMELİ (M8X1.25) K:8',
  },
  {
    id: 92,
    name: 'MF434103Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf P1-A2',
    definition: 'SOMUN, AKB, FLANŞLI (M6X1) K:6',
  },
  {
    id: 93,
    name: 'MF450401Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf P1-A3',
    definition: 'RONDELA, YAYLI (B 3) (1X3X6.5)',
  },
  {
    id: 94,
    name: 'MH020804Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf P1-A4',
    definition: 'KLİPS (12)',
  },
  {
    id: 95,
    name: 'TF100029-AY',
    quantity: 1,
    minStock: 1,
    location: 'Raf Q1-B1',
    definition: 'CİVATA ALYAN BAŞLI M6x1x20 K:8.8',
  },
  {
    id: 96,
    name: 'TF100033-AY',
    quantity: 1,
    minStock: 1,
    location: 'Raf Q1-B2',
    definition: 'CİVATA, ALYAN (M6x1x40-8.8)',
  },
  {
    id: 97,
    name: 'TF101256Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf Q1-B3',
    definition: 'CİVATA ALYAN BAŞLI (M8x1.25x20-8.8)',
  },
  {
    id: 98,
    name: 'TF133039Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf Q1-B4',
    definition: 'CİVATA ALYAN BAŞLI (M10x1.5x25-8.8)',
  },
  {
    id: 99,
    name: 'TY310128Y',
    quantity: 1,
    minStock: 1,
    location: 'Raf R1-C1',
    definition: 'CİVATA ALYAN BAŞLI (M6X1X8.5) K:8.8A',
  },
];

// --- Üretim Miktarı Hesaplama (Mevcut haliyle kalsın) ---
function calculateProduction(stock: StockItem[]) {
  if (stock.length === 0) return 0;
  // Sınırlayıcı faktör, miktar ve minimum stok oranının en küçüğüdür
  return Math.min(
    ...stock.map((item) =>
      item.minStock > 0 ? Math.floor(item.quantity / item.minStock) : Infinity,
    ),
  );
}

// --- Özel Modal Bileşeni (Custom Alert/Confirm) ---
interface CustomModalProps {
  type: 'alert' | 'confirm';
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  title?: string;
  show: boolean; // 'show' property eklendi
}

const CustomModal: React.FC<CustomModalProps> = ({
  type,
  message,
  onConfirm,
  onCancel,
  title,
  show,
}) => {
  // show prop'u eklendi
  if (!show) return null; // show false ise modalı render etme

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border border-blue-200 transform scale-95 opacity-0 animate-scale-in">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {title || (type === 'alert' ? 'Bilgi' : 'Onay Gerekiyor')}
        </h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          {type === 'confirm' && (
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold shadow hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              İptal
            </button>
          )}
          <button
            onClick={onConfirm || onCancel} // Alert için sadece onCancel yeterli
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {type === 'alert' ? 'Tamam' : 'Onayla'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Üretim Bilgisi Gösterimi Bileşeni ---
// Bu bileşen ProductionInfo({ stock }) aynı dosyada kalacak şekilde düzenlendi.
// App Router kuralına uyması için export kaldırıldı ve sadece iç kullanım için function olarak bırakıldı.
function ProductionInfo({ stock }: { stock: StockItem[] }) {
  const possibleProductions = calculateProduction(stock);
  const lowStockItems = stock.filter((item) => item.quantity <= item.minStock).length;

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Box className="w-10 h-10 text-blue-600 flex-shrink-0" />
        <div>
          <h2 className="text-xl font-bold text-gray-800">Üretilebilecek Batarya Seti</h2>
          <p className="text-gray-600 text-sm">
            Mevcut stok ile üretilebilecek tam batarya seti sayısı.
          </p>
        </div>
      </div>
      <div className="flex-shrink-0 bg-blue-600 text-white rounded-full px-6 py-3 text-2xl font-extrabold shadow-md transform hover:scale-105 transition-transform">
        {possibleProductions} Adet
      </div>
      {lowStockItems > 0 && (
        <div className="flex items-center gap-2 text-orange-700 bg-orange-100 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm">
          <AlertTriangle className="w-5 h-5" />
          <span>{lowStockItems} kalem kritik stokta!</span>
        </div>
      )}
    </div>
  );
}

// --- Ana Depo Yönetim Sayfası Bileşeni ---
export default function StockManagementPage() {
  const [stock, setStock] = useState<StockItem[]>(initialStock);
  const [search, setSearch] = useState('');
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null); // Dosya inputuna erişim için ref
  const [modal, setModal] = useState<{
    show: boolean;
    type: 'alert' | 'confirm';
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    title?: string;
  } | null>(null);

  const [newItem, setNewItem] = useState<Omit<StockItem, 'id'>>({
    name: '',
    quantity: 0,
    minStock: 0,
    location: '',
    definition: '',
  });

  // Stok listesini filtreleme ve sıralama (performans için useMemo ile)
  const filteredAndSortedStock = useMemo(() => {
    const filtered = stock.filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase()) ||
        item.definition.toLowerCase().includes(search.toLowerCase()),
    );
    // Kritik stoktaki öğeleri üste taşı
    return filtered.sort((a, b) => {
      const isACritical = a.quantity <= a.minStock;
      const isBCritical = b.quantity <= b.minStock;
      if (isACritical && !isBCritical) return -1; // A kritikse öne al
      if (!isACritical && isBCritical) return 1; // B kritikse öne al
      return a.name.localeCompare(b.name); // Alfabetik sıralama
    });
  }, [stock, search]);

  // Yeni ürün ekleme işlemi
  const handleAddItem = useCallback(() => {
    if (
      !newItem.name ||
      newItem.quantity < 0 ||
      newItem.minStock < 0 ||
      !newItem.location ||
      !newItem.definition
    ) {
      setModal({
        show: true,
        type: 'alert',
        message: 'Lütfen tüm zorunlu alanları doldurun!',
        title: 'Eksik Bilgi',
      });
      return;
    }

    // Ürün kodunun zaten var olup olmadığını kontrol et
    const existingItem = stock.find((item) => item.name === newItem.name);
    if (existingItem) {
      setModal({
        show: true,
        type: 'alert',
        message: `"${newItem.name}" ürünü zaten mevcut. Miktarını güncellemek için mevcut ürünü düzenleyin.`,
        title: 'Ürün Zaten Var',
      });
      return;
    }

    setStock((prevStock) => [
      ...prevStock,
      {
        ...newItem,
        id: Date.now(), // Benzersiz ID
      },
    ]);
    setNewItem({ name: '', quantity: 0, minStock: 0, location: '', definition: '' }); // Formu sıfırla
    setShowAddItemForm(false); // Formu kapat
    setModal({ show: true, type: 'alert', message: 'Ürün başarıyla eklendi!', title: 'Başarılı' });
  }, [newItem, stock]); // `stock` bağımlılığı eklendi

  // Miktar güncelleme işlemi
  const handleUpdateQuantity = useCallback((id: number, delta: number) => {
    setStock((prevStock) =>
      prevStock.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item,
      ),
    );
  }, []); // `setStock` stabil olduğu için bağımlılığa gerek yok

  // Stoktan ürün silme işlemi
  const handleDelete = useCallback((id: number) => {
    setModal({
      show: true,
      type: 'confirm',
      message: 'Bu öğeyi depo listesinden kalıcı olarak silmek istediğinizden emin misiniz?',
      title: 'Silme Onayı',
      onConfirm: () => {
        setStock((prevStock) => prevStock.filter((item) => item.id !== id));
        setModal(null); // Modalı kapat
        setModal({
          show: true,
          type: 'alert',
          message: 'Ürün başarıyla silindi.',
          title: 'Başarılı',
        });
      },
      onCancel: () => setModal(null),
    });
  }, []); // `setStock` ve `setModal` stabil olduğu için bağımlılığa gerek yok

  // Stok konumunu güncelleme işlemi (Inline düzenleme için)
  const handleUpdateLocation = useCallback((id: number, newLocation: string) => {
    setStock((prevStock) =>
      prevStock.map((item) => (item.id === id ? { ...item, location: newLocation } : item)),
    );
  }, []); // `setStock` stabil olduğu için bağımlılığa gerek yok

  // CSV İndirme
  const exportToCSV = useCallback(() => {
    const headers = ['Ürün Kodu', 'Mevcut Miktar', 'Minimum Stok', 'Konum', 'Tanım'];
    const csvContent = [
      headers.join(';'),
      ...filteredAndSortedStock.map((item) =>
        [
          `"${item.name.replace(/"/g, '""')}"`,
          item.quantity,
          item.minStock,
          `"${item.location.replace(/"/g, '""')}"`,
          `"${item.definition.replace(/"/g, '""')}"`,
        ].join(';'),
      ),
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'batarya-depo-stok.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredAndSortedStock]);

  // --- CSV Yükleme ve Stok Güncelleme İşlemi ---
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        setModal({
          show: true,
          type: 'alert',
          message: 'Lütfen bir CSV dosyası seçin.',
          title: 'Dosya Seçilmedi',
        });
        return;
      }

      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setModal({
          show: true,
          type: 'alert',
          message: 'Sadece CSV dosyaları desteklenmektedir.',
          title: 'Geçersiz Dosya Formatı',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter((line) => line.trim() !== '');
          if (lines.length === 0) {
            setModal({
              show: true,
              type: 'alert',
              message: 'CSV dosyası boş.',
              title: 'Boş Dosya',
            });
            return;
          }

          const headers = lines[0].split(';').map((h) => h.trim().toLowerCase());
          const expectedHeaders = ['ürün kodu', 'mevcut miktar', 'minimum stok', 'konum', 'tanım'];

          // Başlık kontrolü
          const hasValidHeaders = expectedHeaders.every((eh) => headers.includes(eh));
          if (!hasValidHeaders) {
            setModal({
              show: true,
              type: 'alert',
              message: `Geçersiz CSV başlıkları. Beklenen: ${expectedHeaders.join(', ')}`,
              title: 'CSV Hatası',
            });
            return;
          }

          const newStockItems: StockItem[] = [];
          // updatedCount ve addedCount artık useRef değil, geçici değişkenler
          let updatedCount = 0;
          let addedCount = 0;

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(';');
            if (values.length !== headers.length) continue; // Hatalı satırları atla

            const item: Partial<StockItem> = {};
            headers.forEach((header, index) => {
              const value = values[index]?.trim() || '';
              switch (header) {
                case 'ürün kodu':
                  item.name = value;
                  break;
                case 'mevcut miktar':
                  item.quantity = Number(value);
                  break;
                case 'minimum stok':
                  item.minStock = Number(value);
                  break;
                case 'konum':
                  item.location = value;
                  break;
                case 'tanım':
                  item.definition = value;
                  break;
              }
            });

            // Zorunlu alan kontrolü (CSV'den gelen veri için)
            if (
              item.name &&
              item.quantity !== undefined &&
              item.minStock !== undefined &&
              item.location &&
              item.definition
            ) {
              newStockItems.push({
                id: Date.now() + i, // Geçici unique ID
                name: item.name,
                quantity: item.quantity,
                minStock: item.minStock,
                location: item.location,
                definition: item.definition,
              });
            }
          }

          setStock((prevStock) => {
            const updatedStockMap = new Map<string, StockItem>();
            prevStock.forEach((item) => updatedStockMap.set(item.name, item)); // Mevcut stoktan bir harita oluştur

            newStockItems.forEach((csvItem) => {
              const existing = updatedStockMap.get(csvItem.name);
              if (existing) {
                // Mevcutsa güncelle (quantity'i topla, diğerlerini overwrite et)
                updatedStockMap.set(csvItem.name, {
                  ...existing,
                  quantity: existing.quantity + csvItem.quantity, // Miktarı topla
                  minStock: csvItem.minStock, // Min stoğu güncelle
                  location: csvItem.location, // Konumu güncelle
                  definition: csvItem.definition, // Tanımı güncelle
                });
                updatedCount++; // Doğrudan güncelliyoruz
              } else {
                // Mevcut değilse yeni olarak ekle
                updatedStockMap.set(csvItem.name, { ...csvItem, id: Date.now() + Math.random() }); // Yeni ID ver
                addedCount++; // Doğrudan güncelliyoruz
              }
            });
            return Array.from(updatedStockMap.values()); // Güncellenmiş stok listesini döndür
          });

          setModal({
            show: true,
            type: 'alert',
            title: 'CSV Yükleme Başarılı',
            message: `${addedCount} yeni ürün eklendi, ${updatedCount} ürün güncellendi!`,
          });
        } catch (error) {
          console.error('CSV okuma veya işleme hatası:', error);
          setModal({
            show: true,
            type: 'alert',
            message: 'CSV dosyası okunurken bir hata oluştu. Lütfen formatı kontrol edin.',
            title: 'Hata',
          });
        } finally {
          if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Input'u sıfırla
          }
        }
      };
      reader.readAsText(file, 'UTF-8'); // UTF-8 ile oku
    },
    [setModal, setStock],
  ); // setModal ve setStock stabil referanslar olduğundan bağımlılığa eklendi.

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-3xl shadow-2xl border border-blue-100">
        <div className="flex items-center gap-4 mb-8">
          <Package className="w-12 h-12 text-indigo-600 flex-shrink-0" />
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
            Batarya Atölyesi Depo Yönetimi
          </h1>
        </div>

        {/* Üretim Bilgisi Kartı */}
        <ProductionInfo stock={stock} />

        {/* Arama, Yeni Ürün ve Excel İşlemleri */}
        <div className="mb-8 flex flex-col md:flex-row items-center gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-lg"
              placeholder="Stok ara (ürün kodu, konum, tanım...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Stokta ara"
            />
          </div>
          <button
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setShowAddItemForm(!showAddItemForm)}
            aria-label="Yeni Ürün Ekle"
          >
            <PlusCircle className="w-5 h-5" /> Yeni Ürün Ekle
          </button>
          <button
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold shadow-md hover:bg-green-700 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={exportToCSV}
            aria-label="CSV İndir"
          >
            <Download className="w-5 h-5" /> CSV İndir
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden" // Gizli input
          />
          <button
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold shadow-md hover:bg-purple-700 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-purple-500"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Excel ile Güncelle"
          >
            <UploadCloud className="w-5 h-5" /> Excel ile Güncelle
          </button>
        </div>

        {/* Yeni Ürün Ekleme Formu */}
        {showAddItemForm && (
          <div className="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-200 shadow-inner animate-fade-in-up">
            <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Yeni Stok Ürünü Formu
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                className="border border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-300 placeholder-gray-500 text-gray-800"
                placeholder="Ürün Kodu/Adı"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                aria-label="Ürün Kodu veya Adı"
              />
              <input
                className="border border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-300 placeholder-gray-500 text-gray-800"
                type="number"
                min={0}
                placeholder="Miktar"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                aria-label="Mevcut Miktar"
              />
              <input
                className="border border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-300 placeholder-gray-500 text-gray-800"
                type="number"
                min={0}
                placeholder="Minimum Stok"
                value={newItem.minStock}
                onChange={(e) => setNewItem({ ...newItem, minStock: Number(e.target.value) })}
                aria-label="Minimum Stok Miktarı"
              />
              <input
                className="border border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-300 placeholder-gray-500 text-gray-800"
                placeholder="Depo Konumu (Örn: Raf A1-B3)"
                value={newItem.location}
                onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                aria-label="Depo Konumu"
              />
              <input
                className="border border-blue-200 rounded-lg px-4 py-2 col-span-full focus:outline-none focus:ring-1 focus:ring-blue-300 placeholder-gray-500 text-gray-800"
                placeholder="Ürün Tanımı (Örn: BATARYA KONTROL ÜNİTESİ)"
                value={newItem.definition}
                onChange={(e) => setNewItem({ ...newItem, definition: e.target.value })}
                aria-label="Ürün Tanımı"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold shadow hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                onClick={() => setShowAddItemForm(false)}
                aria-label="İptal"
              >
                İptal
              </button>
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={handleAddItem}
                aria-label="Ürün Ekle"
              >
                <Save className="w-5 h-5 inline-block mr-2" /> Ürün Ekle
              </button>
            </div>
          </div>
        )}

        {/* Stok Tablosu */}
        <div className="overflow-x-auto mt-8 rounded-2xl shadow-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ürün Kodu
                </th>
                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Mevcut Miktar
                </th>
                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Min. Stok
                </th>
                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Konum
                </th>
                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tanım
                </th>
                <th className="py-3 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Eylemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedStock.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500 text-lg">
                    Depoda hiç ürün bulunamadı.
                  </td>
                </tr>
              )}
              {filteredAndSortedStock.map((item) => (
                <tr
                  key={item.id}
                  className={
                    item.quantity <= item.minStock
                      ? 'bg-red-50 hover:bg-red-100 transition-colors'
                      : 'hover:bg-blue-50 transition-colors'
                  }
                >
                  <td className="py-3 px-6 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="py-3 px-6 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <button
                        className="bg-gray-200 px-3 py-1 rounded-lg text-lg font-bold text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        disabled={item.quantity === 0}
                        aria-label="Miktarı Azalt"
                      >
                        –
                      </button>
                      <span className="font-mono text-base w-10 text-center font-semibold text-blue-700">
                        {item.quantity}
                      </span>
                      <button
                        className="bg-gray-200 px-3 py-1 rounded-lg text-lg font-bold text-gray-700 hover:bg-gray-300 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        aria-label="Miktarı Artır"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-6 whitespace-nowrap text-sm">
                    <span
                      className={
                        item.quantity <= item.minStock ? 'text-red-600 font-bold' : 'text-gray-700'
                      }
                    >
                      {item.minStock}
                    </span>
                    {item.quantity <= item.minStock && (
                      <span title="Kritik Stok Seviyesi!">
                        {' '}
                        {/* title attribute wrapped in span */}
                        <AlertTriangle className="w-4 h-4 inline-block ml-2 text-red-500 animate-pulse" />
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-6 whitespace-nowrap text-sm text-gray-700">
                    <input
                      type="text"
                      value={item.location}
                      onChange={(e) => handleUpdateLocation(item.id, e.target.value)}
                      className="w-full p-1 border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400 text-sm focus:outline-none"
                    />
                  </td>
                  <td
                    className="py-3 px-6 text-sm text-gray-700 max-w-xs truncate"
                    title={item.definition}
                  >
                    {item.definition}
                  </td>
                  <td className="py-3 px-6 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-red-600 hover:text-red-800 transition-colors ml-4 p-2 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                      onClick={() => handleDelete(item.id)}
                      title="Ürünü Sil"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Renderlama */}
      {modal && (
        <CustomModal
          type={modal.type}
          message={modal.message}
          onConfirm={modal.onConfirm}
          onCancel={modal.onCancel}
          title={modal.title}
          show={modal.show} // 'show' prop'u eklendi
        />
      )}
    </div>
  );
}
