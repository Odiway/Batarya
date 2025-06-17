// components/BatteryAnalysisDashboard.js
'use client'; // Next.js 13+ App Router için gerekli

import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

// Lucide React icons - Next.js'te kullanmak için
import {
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Activity,
  Battery,
  Thermometer,
  Clock,
} from 'lucide-react';

const BatteryAnalysisDashboard = ({
  realTimeData = null,
  onDataUpdate = null,
  className = '',
  autoStart = false,
}) => {
  const [isRunning, setIsRunning] = useState(autoStart);
  const [currentTime, setCurrentTime] = useState(0);
  const [batteryData, setBatteryData] = useState([]);
  const [analysisResults, setAnalysisResults] = useState({
    socHealth: 'healthy',
    currentVoltageRelation: 'normal',
    temperatureStatus: 'normal',
    chargingTime: 0,
    energyEfficiency: 95.2,
    cycleCount: 0,
    anomalies: [],
  });
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    soc: 80,
    voltage: 12.6,
    current: 0,
    temperature: 25,
    power: 0,
  });

  const intervalRef = useRef();

  // AI Analiz Motoru
  const analyzeData = (data) => {
    const latest = data[data.length - 1];
    if (!latest) return;

    const anomalies = [];
    let socHealth = 'healthy';
    let currentVoltageRelation = 'normal';
    let temperatureStatus = 'normal';

    // SOC Eğrisi Analizi
    if (data.length > 5) {
      const socChanges = data
        .slice(-5)
        .map((d, i, arr) => (i > 0 ? Math.abs(d.soc - arr[i - 1].soc) : 0));
      const avgSocChange = socChanges.reduce((a, b) => a + b, 0) / socChanges.length;

      if (avgSocChange > 5) {
        socHealth = 'unstable';
        anomalies.push('SOC eğrisinde ani değişimler tespit edildi');
      }
    }

    // Akım-Voltaj İlişkisi Analizi
    if (latest.voltage < 11.0 && Math.abs(latest.current) > 50) {
      currentVoltageRelation = 'abnormal';
      anomalies.push('Düşük voltajda yüksek akım - sistem sorunu olabilir');
    }

    // Sıcaklık Analizi
    if (latest.temperature > 45) {
      temperatureStatus = 'critical';
      anomalies.push('Kritik sıcaklık seviyesi - hücre yaşlanması riski');
    } else if (latest.temperature > 35) {
      temperatureStatus = 'warning';
      anomalies.push('Yüksek sıcaklık tespit edildi');
    }

    // Hızlı Boşalma Kontrolü
    if (data.length > 2) {
      const socDrop = data[data.length - 2].soc - latest.soc;
      if (socDrop > 10) {
        anomalies.push('Anormal hızlı boşalma tespit edildi - hücre arızası olabilir');
      }
    }

    const newResults = {
      socHealth,
      currentVoltageRelation,
      temperatureStatus,
      anomalies,
      energyEfficiency: 95.2 - (latest.temperature - 25) * 0.5,
      cycleCount: Math.floor(currentTime / 100),
    };

    setAnalysisResults(newResults);

    // Parent component'e veri gönder
    if (onDataUpdate) {
      onDataUpdate({
        metrics: latest,
        analysis: newResults,
        rawData: data,
      });
    }
  };

  // Gerçek zamanlı veri simülasyonu
  const generateDataPoint = (time) => {
    const cyclePosition = (time % 200) / 200;
    const isCharging = cyclePosition < 0.6;

    let soc, current, voltage, temperature;

    if (isCharging) {
      soc = Math.min(100, 20 + (cyclePosition / 0.6) * 80);
      current = 30 + Math.sin(time * 0.1) * 5;
      voltage = 12.0 + (soc / 100) * 2.4 + Math.random() * 0.2;
      temperature = 25 + (current / 35) * 15 + Math.sin(time * 0.05) * 3;
    } else {
      const dischargeProgress = (cyclePosition - 0.6) / 0.4;
      soc = Math.max(20, 100 - dischargeProgress * 80);
      current = -(25 + Math.sin(time * 0.08) * 8);
      voltage = 14.4 - dischargeProgress * 2.4 + Math.random() * 0.15;
      temperature = 30 - dischargeProgress * 8 + Math.sin(time * 0.03) * 2;
    }

    // Rastgele anomaliler
    if (Math.random() < 0.02) {
      if (Math.random() < 0.5) {
        soc += Math.random() * 15 - 7.5;
      } else {
        temperature += Math.random() * 20;
      }
    }

    const power = (voltage * current) / 1000;

    return {
      time: time,
      soc: Math.max(0, Math.min(100, soc)),
      voltage: Math.max(10, Math.min(15, voltage)),
      current: Math.max(-100, Math.min(100, current)),
      temperature: Math.max(15, Math.min(60, temperature)),
      power: power,
    };
  };

  // Dış veri kaynağı kullanımı
  useEffect(() => {
    if (realTimeData) {
      setBatteryData((prev) => {
        const newData = [...prev, realTimeData].slice(-200);
        analyzeData(newData);
        return newData;
      });

      setRealTimeMetrics({
        soc: realTimeData.soc,
        voltage: realTimeData.voltage,
        current: realTimeData.current,
        temperature: realTimeData.temperature,
        power: realTimeData.power,
      });
    }
  });

  useEffect(() => {
    if (isRunning && !realTimeData) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 1;
          const newDataPoint = generateDataPoint(newTime);

          setBatteryData((prevData) => {
            const newData = [...prevData, newDataPoint].slice(-200);
            analyzeData(newData);
            return newData;
          });

          setRealTimeMetrics({
            soc: newDataPoint.soc,
            voltage: newDataPoint.voltage,
            current: newDataPoint.current,
            temperature: newDataPoint.temperature,
            power: newDataPoint.power,
          });

          return newTime;
        });
      }, 100);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, realTimeData]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setCurrentTime(0);
    setBatteryData([]);
    setAnalysisResults({
      socHealth: 'healthy',
      currentVoltageRelation: 'normal',
      temperatureStatus: 'normal',
      chargingTime: 0,
      energyEfficiency: 95.2,
      cycleCount: 0,
      anomalies: [],
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'normal':
        return 'text-green-600';
      case 'warning':
      case 'unstable':
        return 'text-yellow-600';
      case 'critical':
      case 'abnormal':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
      case 'normal':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
      case 'unstable':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
      case 'abnormal':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 ${className}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI Batarya Analiz Sistemi</h1>
          <p className="text-blue-200">Gerçek Zamanlı İzleme ve Anomali Tespiti</p>
        </div>

        {/* Kontrol Paneli */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6">
          <div className="flex justify-center space-x-4 mb-4">
            <button
              onClick={handleStart}
              disabled={isRunning}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Play className="w-4 h-4 mr-2" />
              Başlat
            </button>
            <button
              onClick={handlePause}
              disabled={!isRunning}
              className="flex items-center px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Pause className="w-4 h-4 mr-2" />
              Duraklat
            </button>
            <button
              onClick={handleReset}
              className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Sıfırla
            </button>
          </div>
          <div className="text-center text-white">
            <span className="text-lg font-mono">Zaman: {currentTime}s</span>
          </div>
        </div>

        {/* Gerçek Zamanlı Metrikler */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-center">
            <Battery className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{realTimeMetrics.soc.toFixed(1)}%</div>
            <div className="text-blue-200 text-sm">SOC</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-center">
            <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {realTimeMetrics.voltage.toFixed(2)}V
            </div>
            <div className="text-green-200 text-sm">Voltaj</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-center">
            <Activity className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {realTimeMetrics.current.toFixed(1)}A
            </div>
            <div className="text-yellow-200 text-sm">Akım</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-center">
            <Thermometer className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {realTimeMetrics.temperature.toFixed(1)}°C
            </div>
            <div className="text-red-200 text-sm">Sıcaklık</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-center">
            <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {realTimeMetrics.power.toFixed(2)}kW
            </div>
            <div className="text-purple-200 text-sm">Güç</div>
          </div>
        </div>

        {/* AI Analiz Sonuçları */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">🤖 AI Analiz Sonuçları</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-black/20 rounded-lg p-4">
              <div
                className={`flex items-center mb-2 ${getStatusColor(analysisResults.socHealth)}`}
              >
                {getStatusIcon(analysisResults.socHealth)}
                <span className="ml-2 font-semibold">SOC Sağlığı</span>
              </div>
              <div className="text-white text-sm">
                {analysisResults.socHealth === 'healthy' ? 'Düzgün eğri' : 'Anormal değişimler'}
              </div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div
                className={`flex items-center mb-2 ${getStatusColor(analysisResults.currentVoltageRelation)}`}
              >
                {getStatusIcon(analysisResults.currentVoltageRelation)}
                <span className="ml-2 font-semibold">Akım-Voltaj</span>
              </div>
              <div className="text-white text-sm">
                {analysisResults.currentVoltageRelation === 'normal'
                  ? 'Normal ilişki'
                  : 'Anormal değerler'}
              </div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div
                className={`flex items-center mb-2 ${getStatusColor(analysisResults.temperatureStatus)}`}
              >
                {getStatusIcon(analysisResults.temperatureStatus)}
                <span className="ml-2 font-semibold">Sıcaklık</span>
              </div>
              <div className="text-white text-sm">
                {analysisResults.temperatureStatus === 'normal'
                  ? 'Güvenli seviye'
                  : analysisResults.temperatureStatus === 'warning'
                    ? 'Yüksek sıcaklık'
                    : 'Kritik seviye'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {analysisResults.energyEfficiency.toFixed(1)}%
              </div>
              <div className="text-blue-200 text-sm">Enerji Verimi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{analysisResults.cycleCount}</div>
              <div className="text-green-200 text-sm">Döngü Sayısı</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {analysisResults.anomalies.length}
              </div>
              <div className="text-red-200 text-sm">Anomali Sayısı</div>
            </div>
          </div>

          {analysisResults.anomalies.length > 0 && (
            <div className="mt-4 bg-red-900/20 border border-red-600/30 rounded-lg p-4">
              <h3 className="text-red-400 font-semibold mb-2">⚠️ Tespit Edilen Anomaliler:</h3>
              <ul className="text-red-200 text-sm space-y-1">
                {analysisResults.anomalies.map((anomaly, index) => (
                  <li key={index}>• {anomaly}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Grafikler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SOC Eğrisi */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">📊 SOC Eğrisi İzleme</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={batteryData}>
                <CartesianGrid strokeDasharray="3,3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                />
                <Area
                  type="monotone"
                  dataKey="soc"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Voltaj ve Akım */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">⚡ Voltaj ve Akım</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={batteryData}>
                <CartesianGrid strokeDasharray="3,3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="voltage"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="current"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Sıcaklık İzleme */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">🌡️ Sıcaklık İzleme</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={batteryData}>
                <CartesianGrid strokeDasharray="3,3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Güç Analizi */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">🔋 Güç Analizi</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={batteryData}>
                <CartesianGrid strokeDasharray="3,3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                />
                <Area
                  type="monotone"
                  dataKey="power"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Veri Akışı Bilgisi */}
        <div className="mt-6 bg-white/10 backdrop-blur-md rounded-lg p-4">
          <div className="text-center text-white">
            <div className="text-sm opacity-75">
              📡 CAN Veri Toplama → 🔄 Decoder (.dbc) → 💾 Veri Tabanı → 🤖 AI Analiz → 📊
              Görselleştirme
            </div>
            <div className="text-xs opacity-50 mt-2">
              Gerçek zamanlı veri işleme ve anomali tespiti aktif
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryAnalysisDashboard;

// Export edilebilir yardımcı fonksiyonlar
export const batteryUtils = {
  // Veri formatına dönüştürme
  formatBatteryData: (rawData) => ({
    time: rawData.timestamp || Date.now(),
    soc: rawData.stateOfCharge || 0,
    voltage: rawData.voltage || 0,
    current: rawData.current || 0,
    temperature: rawData.temperature || 20,
    power: (rawData.voltage * rawData.current) / 1000 || 0,
  }),

  // Anomali kontrol fonksiyonu
  checkAnomaly: (currentData, previousData) => {
    const anomalies = [];

    if (currentData.temperature > 45) {
      anomalies.push('Kritik sıcaklık');
    }

    if (currentData.voltage < 11 && Math.abs(currentData.current) > 50) {
      anomalies.push('Voltaj-akım anomalisi');
    }

    if (previousData && previousData.soc - currentData.soc > 10) {
      anomalies.push('Hızlı SOC düşüşü');
    }

    return anomalies;
  },
};
