'use client';

import React, { useState } from 'react';
import {
  LineChart as LineChartIcon, // Renamed to avoid conflict with our LineChart component
  BarChart2, // Use BarChart2 for bar chart icon
  Target, // For goals
  Gauge, // For KPIs
  ArrowUp, // For positive trend
  ArrowDown, // For negative trend
  BatteryCharging, // A battery specific icon for dashboard
} from 'lucide-react'; // Lucide icons for visual appeal

// --- Batarya Üretim Verileri ---

const initialProductionData = [
  { month: 'Ocak', produced: 1200, defective: 30, shipped: 1100, returned: 10 },
  { month: 'Şubat', produced: 1500, defective: 45, shipped: 1400, returned: 15 },
  { month: 'Mart', produced: 1700, defective: 38, shipped: 1600, returned: 12 },
  { month: 'Nisan', produced: 2000, defective: 50, shipped: 1900, returned: 20 },
  { month: 'Mayıs', produced: 2100, defective: 42, shipped: 2000, returned: 18 },
  { month: 'Haziran', produced: 2300, defective: 55, shipped: 2200, returned: 22 },
  { month: 'Temmuz', produced: 2500, defective: 60, shipped: 2400, returned: 25 },
  { month: 'Ağustos', produced: 2600, defective: 48, shipped: 2500, returned: 19 },
  { month: 'Eylül', produced: 2400, defective: 40, shipped: 2300, returned: 16 },
  { month: 'Ekim', produced: 2200, defective: 35, shipped: 2100, returned: 14 },
  { month: 'Kasım', produced: 2100, defective: 30, shipped: 2000, returned: 12 },
  { month: 'Aralık', produced: 2300, defective: 33, shipped: 2200, returned: 13 },
];

const initialGoals = [
  { id: 1, name: 'Aylık Batarya Üretim Hedefi', target: 2500, current: 2300 },
  { id: 2, name: 'Hatalı Batarya Oranı (%)', target: 2, current: 1.5 },
  { id: 3, name: 'Montaj Hattına Sevkiyat Verimliliği (%)', target: 95, current: 92 },
  { id: 4, name: 'İade Edilen Batarya Sayısı (Hedef Altı)', target: 20, current: 13 },
];

// --- Grafikler ---

interface MultiBarChartProps {
  data: {
    month: string;
    produced: number;
    defective: number;
    shipped: number;
    returned: number;
  }[];
}

const MultiBarChart: React.FC<MultiBarChartProps> = ({ data }) => {
  const maxProduced = Math.max(...data.map((d) => d.produced));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 overflow-x-auto min-h-[350px]">
      <div className="flex items-end h-[300px] space-x-6 px-2 pb-4 pt-12 relative">
        {/* Y-Ekseni etiketleri (basit) */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 py-4 pr-2">
          <span>{maxProduced}</span>
          <span>{Math.round(maxProduced / 2)}</span>
          <span>0</span>
        </div>
        {data.map((d) => (
          <div key={d.month} className="flex flex-col items-center flex-shrink-0 w-12 group">
            s {/* group eklendi */}
            <div className="relative flex flex-col items-center justify-end h-full w-full">
              <div className="flex space-x-1 items-end h-full w-full">
                <div
                  className="bg-blue-600 w-4 rounded-t-sm transition-all duration-300 ease-out hover:opacity-80"
                  style={{ height: `${(d.produced / maxProduced) * 100}%` }}
                  title={`Üretilen Batarya: ${d.produced}`}
                />
                <div
                  className="bg-green-500 w-4 rounded-t-sm transition-all duration-300 ease-out hover:opacity-80"
                  style={{ height: `${(d.shipped / maxProduced) * 100}%` }}
                  title={`Sevk Edilen Batarya: ${d.shipped}`}
                />
                <div
                  className="bg-red-500 w-2 rounded-t-sm transition-all duration-300 ease-out hover:opacity-80"
                  style={{ height: `${(d.defective / maxProduced) * 100}%` }}
                  title={`Hatalı Batarya: ${d.defective}`}
                />
                <div
                  className="bg-yellow-500 w-2 rounded-t-sm transition-all duration-300 ease-out hover:opacity-80"
                  style={{ height: `${(d.returned / maxProduced) * 100}%` }}
                  title={`İade Edilen Batarya: ${d.returned}`}
                />
              </div>
              {/* Tooltip-like values on top */}
              <div className="absolute -top-10 text-[10px] text-gray-700 font-medium bg-white/90 p-1 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                <div className="text-blue-700">Ü:{d.produced}</div>
                <div className="text-green-700">S:{d.shipped}</div>
                <div className="text-red-700">H:{d.defective}</div>
                <div className="text-yellow-700">İ:{d.returned}</div>
              </div>
            </div>
            <span className="text-xs mt-2 font-medium text-gray-600 break-words text-center">
              {d.month}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 text-sm font-medium">
        <div className="flex items-center text-blue-600">
          <span className="inline-block w-3 h-3 bg-blue-600 rounded-sm mr-2" /> Üretilen Batarya
        </div>
        <div className="flex items-center text-green-600">
          <span className="inline-block w-3 h-3 bg-green-600 rounded-sm mr-2" /> Sevk Edilen Batarya
        </div>
        <div className="flex items-center text-red-600">
          <span className="inline-block w-3 h-3 bg-red-600 rounded-sm mr-2" /> Hatalı Batarya
        </div>
        <div className="flex items-center text-yellow-600">
          <span className="inline-block w-3 h-3 bg-yellow-600 rounded-sm mr-2" /> İade Edilen
          Batarya
        </div>
      </div>
    </div>
  );
};

interface LineChartProps {
  data: { month: string; [key: string]: number | string }[];
  valueKey: string;
  color: string;
  label: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, valueKey, color, label }) => {
  const maxValue = Math.max(...data.map((d) => Number(d[valueKey]))) * 1.1; // Add some padding to max value
  const points = data
    .map(
      (d, i) => `${(i / (data.length - 1)) * 100}%,${100 - (Number(d[valueKey]) / maxValue) * 90}%`, // Scale to 90% height for padding
    )
    .join(' ');

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 relative h-64 w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{label} Trendi</h3>
      <svg width="100%" height="calc(100% - 40px)" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Y-Ekseni çizgileri (basit grid) */}
        <line x1="0" y1="0" x2="0" y2="100" stroke="#e0e0e0" strokeWidth="0.5" />
        <line
          x1="0"
          y1="50"
          x2="100"
          y2="50"
          stroke="#e0e0e0"
          strokeWidth="0.5"
          strokeDasharray="2 2"
        />
        <line x1="0" y1="100" x2="100" y2="100" stroke="#e0e0e0" strokeWidth="0.5" />

        {/* Veri Çizgisi */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5" // Daha ince çizgi
          points={points}
        />
        {/* Veri Noktaları */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={`${(i / (data.length - 1)) * 100}%`}
            cy={`${100 - (Number(d[valueKey]) / maxValue) * 90}%`}
            r="1.5" // Daha küçük daireler
            fill={color}
          />
        ))}
      </svg>
      {/* X-Ekseni etiketleri (aylar) */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-around px-4 text-xs text-gray-500">
        {data.map((d, i) => (
          <span
            key={i}
            className="flex-shrink-0 text-center"
            style={{ width: `${100 / data.length}%` }}
          >
            {d.month}
          </span>
        ))}
      </div>
    </div>
  );
};

// --- Hedef İlerlemesi ---

type Goal = {
  id: number;
  name: string;
  target: number;
  current: number;
};

interface GoalProgressProps {
  goal: Goal;
  onUpdate: (id: number, value: number) => void;
}

const GoalProgress: React.FC<GoalProgressProps> = ({ goal, onUpdate }) => {
  const isGoalMet =
    (goal.name.includes('Hata') && goal.current <= goal.target) ||
    (goal.name.includes('Verimliliği') && goal.current >= goal.target) ||
    (goal.name.includes('Üretim') && goal.current >= goal.target) ||
    (goal.name.includes('İade') && goal.current <= goal.target);

  const progressPercentage = Math.min(
    goal.name.includes('Hata') || goal.name.includes('İade') // Hatalı/iade hedefleri için ters mantık
      ? ((goal.target - goal.current) / goal.target) * 100 + 100 // Tam ilerlemeyi göstermek için ölçeklendirme
      : (goal.current / goal.target) * 100,
    100,
  );

  return (
    <div className="mb-6 p-5 bg-gradient-to-r from-white via-blue-50 to-purple-50 rounded-2xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between border border-blue-100 transition-all hover:shadow-xl hover:scale-[1.01]">
      <div className="flex-1 min-w-[180px]">
        <div className="font-bold text-xl text-gray-800 mb-1">{goal.name}</div>
        <div className="text-sm text-gray-600">
          Hedef: <span className="font-semibold text-blue-700">{goal.target}</span> | Mevcut:{' '}
          <span className={`font-semibold ${isGoalMet ? 'text-green-600' : 'text-red-600'}`}>
            {goal.current}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ease-in-out ${isGoalMet ? 'bg-green-500' : 'bg-blue-500'}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      <div className="ml-0 md:ml-6 mt-4 md:mt-0 flex flex-col items-end min-w-[120px]">
        <label className="text-xs text-gray-500 mb-1" htmlFor={`goal-input-${goal.id}`}>
          Mevcut Değeri Güncelle
        </label>
        <input
          id={`goal-input-${goal.id}`}
          type="number"
          min={0}
          step={goal.name.includes('%') ? 0.1 : 1} // Yüzde hedefler için ondalık adım
          className="border border-gray-300 rounded-lg px-3 py-1 w-28 text-center focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-800"
          value={goal.current}
          onChange={(e) => onUpdate(goal.id, Number(e.target.value))}
        />
      </div>
    </div>
  );
};

// --- KPI'lar ---

interface KPICardProps {
  title: string;
  value: number | string;
  unit?: string;
  trend?: number;
  trendType?: 'up' | 'down';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, unit, trend, trendType }) => (
  <div className="bg-white rounded-xl shadow-lg p-5 flex flex-col items-start border border-gray-100 flex-1 min-w-[180px] max-w-full sm:max-w-[calc(50%-1rem)] lg:max-w-[calc(25%-1rem)] transition-all hover:shadow-xl hover:scale-[1.01]">
    <div className="text-sm text-gray-500 mb-2">{title}</div>
    <div className="text-3xl font-extrabold text-blue-700 flex items-baseline">
      {value}
      {unit && <span className="ml-1 text-base font-semibold text-gray-600">{unit}</span>}
    </div>
    {trend !== undefined && (
      <div
        className={`text-sm mt-2 font-medium ${
          trendType === 'up' ? 'text-green-600' : 'text-red-600'
        } flex items-center`}
      >
        {trendType === 'up' ? (
          <ArrowUp className="w-4 h-4 mr-1" />
        ) : (
          <ArrowDown className="w-4 h-4 mr-1" />
        )}{' '}
        {Math.abs(trend)}%
      </div>
    )}
  </div>
);

// --- Ana Sayfa Bileşeni ---

const ReportsPage = () => {
  const [productionData] = useState(initialProductionData);
  const [goals, setGoals] = useState(initialGoals);

  // KPI'lar
  const lastMonth = productionData[productionData.length - 1];
  const prevMonth = productionData[productionData.length - 2]; // undefined olabilir, kontrol et

  const calculateTrend = (current: number, previous: number | undefined): number | undefined => {
    if (previous === undefined || previous === 0) return undefined;
    return Math.round(((current - previous) / previous) * 100);
  };

  const kpis = [
    {
      title: 'Üretilen Batarya (geçen ay)',
      value: lastMonth.produced,
      unit: 'adet',
      trend: calculateTrend(lastMonth.produced, prevMonth?.produced),
      trendType:
        lastMonth.produced >= (prevMonth?.produced || 0) ? ('up' as const) : ('down' as const),
    },
    {
      title: 'Hatalı Batarya Oranı',
      value: ((lastMonth.defective / lastMonth.produced) * 100).toFixed(2),
      unit: '%',
      trend: calculateTrend(
        lastMonth.defective / lastMonth.produced,
        prevMonth?.defective / prevMonth?.produced,
      ),
      trendType:
        lastMonth.defective / lastMonth.produced <=
        (prevMonth?.defective / prevMonth?.produced || Infinity)
          ? ('down' as const)
          : ('up' as const), // Hata oranı düşüşü iyi, artışı kötü
    },
    {
      title: 'Montaj Hattına Sevk Edilen',
      value: lastMonth.shipped,
      unit: 'adet',
      trend: calculateTrend(lastMonth.shipped, prevMonth?.shipped),
      trendType:
        lastMonth.shipped >= (prevMonth?.shipped || 0) ? ('up' as const) : ('down' as const),
    },
    {
      title: 'İade Edilen Batarya',
      value: lastMonth.returned,
      unit: 'adet',
      trend: calculateTrend(lastMonth.returned, prevMonth?.returned),
      trendType:
        lastMonth.returned <= (prevMonth?.returned || Infinity)
          ? ('down' as const)
          : ('up' as const), // İade düşüşü iyi, artışı kötü
    },
  ];

  const handleGoalUpdate = (id: number, value: number) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, current: value } : g)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-3xl shadow-2xl border border-blue-100">
        <div className="flex items-center gap-4 mb-8">
          <BatteryCharging className="w-12 h-12 text-blue-600 flex-shrink-0" />
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
            Batarya Atölyesi Kontrol Paneli
          </h1>
        </div>

        {/* Temel Performans Göstergeleri */}
        <section className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
          <h2 className="text-2xl font-bold mb-5 text-gray-800 flex items-center gap-2">
            <Gauge className="w-6 h-6 text-blue-500" /> Atölye Performans Göstergeleri
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            {kpis.map((kpi, i) => (
              <KPICard key={i} {...kpi} />
            ))}
          </div>
        </section>

        {/* Aylık Batarya Üretim Genel Bakışı */}
        <section className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
          <h2 className="text-2xl font-bold mb-5 text-gray-800 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-green-500" /> Aylık Batarya Üretim Genel Bakışı
          </h2>
          <MultiBarChart data={productionData} />
        </section>

        {/* Batarya Üretim Trendleri */}
        <section className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
          <h2 className="text-2xl font-bold mb-5 text-gray-800 flex items-center gap-2">
            <LineChartIcon className="w-6 h-6 text-purple-500" /> Batarya Üretim Trendleri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <LineChart
              data={productionData}
              valueKey="produced"
              color="#2563eb"
              label="Üretilen Batarya"
            />
            <LineChart
              data={productionData}
              valueKey="shipped"
              color="#22c55e"
              label="Sevk Edilen Batarya"
            />
            <LineChart
              data={productionData}
              valueKey="defective"
              color="#ef4444"
              label="Hatalı Batarya"
            />
            <LineChart
              data={productionData}
              valueKey="returned"
              color="#eab308"
              label="İade Edilen Batarya"
            />
          </div>
        </section>

        {/* Atölye Hedef Takibi */}
        <section className="p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
          <h2 className="text-2xl font-bold mb-5 text-gray-800 flex items-center gap-2">
            <Target className="w-6 h-6 text-orange-500" /> Atölye Hedef Takibi
          </h2>
          {goals.map((goal) => (
            <GoalProgress key={goal.id} goal={goal} onUpdate={handleGoalUpdate} />
          ))}
        </section>
      </div>
    </div>
  );
};

export default ReportsPage;
