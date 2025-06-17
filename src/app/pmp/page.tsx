'use client';

import React, { useState, useEffect } from 'react';
import usePollingData from '../hooks/usePollingData';
import LineChart from '../../components/LineChart'; // Tek nokta ile yukarı çıkmak yeterli

const MAX_CHART_DATA_POINTS = 100;

const DashboardPage = () => {
  const { latestData, isLoading, error, isConnected } = usePollingData(
    'http://localhost:3000/api/can-data',
    { intervalMs: 200 },
  );

  const [labels, setLabels] = useState<string[]>([]);
  const [speedData, setSpeedData] = useState<number[]>([]);
  const [socData, setSocData] = useState<number[]>([]);
  const [motorTempData, setMotorTempData] = useState<number[]>([]);
  const [batteryTempMaxData, setBatteryTempMaxData] = useState<number[]>([]);
  const [ambientTempData, setAmbientTempData] = useState<number[]>([]);
  const [tirePressureData, setTirePressureData] = useState<number[]>([]);
  const [auxBatteryVoltageData, setAuxBatteryVoltageData] = useState<number[]>([]);
  const [coolantTempData, setCoolantTempData] = useState<number[]>([]);

  const [currentBusState, setCurrentBusState] = useState<any | null>(null);

  useEffect(() => {
    if (latestData) {
      setCurrentBusState(latestData);

      const timestampSeconds = new Date(latestData.timestamp).toLocaleTimeString('tr-TR', {
        second: '2-digit',
        minute: '2-digit',
        hour: '2-digit',
      });

      setLabels((prev) => [...prev.slice(-(MAX_CHART_DATA_POINTS - 1)), timestampSeconds]);
      setSpeedData((prev) => [
        ...prev.slice(-(MAX_CHART_DATA_POINTS - 1)),
        latestData.vehicleSpeed,
      ]);
      setSocData((prev) => [...prev.slice(-(MAX_CHART_DATA_POINTS - 1)), latestData.batterySOC]);
      setMotorTempData((prev) => [
        ...prev.slice(-(MAX_CHART_DATA_POINTS - 1)),
        latestData.motorTemperature,
      ]);
      setBatteryTempMaxData((prev) => [
        ...prev.slice(-(MAX_CHART_DATA_POINTS - 1)),
        latestData.batteryTempMax,
      ]);
      setAmbientTempData((prev) => [
        ...prev.slice(-(MAX_CHART_DATA_POINTS - 1)),
        latestData.ambientTemperature,
      ]);
      setTirePressureData((prev) => [
        ...prev.slice(-(MAX_CHART_DATA_POINTS - 1)),
        latestData.tirePressure,
      ]);
      setAuxBatteryVoltageData((prev) => [
        ...prev.slice(-(MAX_CHART_DATA_POINTS - 1)),
        latestData.auxBatteryVoltage,
      ]);
      setCoolantTempData((prev) => [
        ...prev.slice(-(MAX_CHART_DATA_POINTS - 1)),
        latestData.coolantTemp,
      ]);
    }
  }, [latestData]);

  const sendCommand = async (command: any) => {
    try {
      const response = await fetch('http://localhost:8766/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Komut gönderme hatası: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      console.log('Komut başarıyla gönderildi:', result);
      alert(`Komut gönderildi: ${result.message}`);
    } catch (err: any) {
      console.error('Komut gönderme hatası:', err.message);
      alert(`Komut gönderme hatası: ${err.message}. Python komut sunucusu çalışıyor mu?`);
    }
  };

  const handleSetDriverProfile = (profile: string) => {
    sendCommand({ type: 'set_driver_profile', profile: profile });
  };

  const handleInjectFault = (
    faultType: string,
    severity: number,
    intermittent: boolean = false,
    interval: number = 60,
    duration: number = 5,
    details: { [key: string]: any } = {},
  ) => {
    sendCommand({
      type: 'inject_fault',
      fault_type: faultType,
      severity_start: severity,
      intermittent: intermittent,
      intermittent_interval_s: interval,
      intermittent_duration_s: duration,
      details: details,
    });
  };

  const handleClearFaults = () => {
    sendCommand({ type: 'clear_faults' });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Elektrikli Otobüs Simülasyon Dashboard</h1>

      {/* Bağlantı Durumu */}
      <div
        className={`p-2 rounded-md mb-4 ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
      >
        Polling Durumu: {isLoading ? 'Yükleniyor...' : isConnected ? 'Veri Akışı Var' : 'Hata!'}
        {error && <p className="text-red-600">Hata: {error}</p>}
      </div>

      {/* Kontrol Paneli */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-3">Simülatör Kontrolleri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Sürücü Profili</h3>
            {['normal', 'aggressive', 'defensive', 'tired'].map((profile) => (
              <button
                key={profile}
                onClick={() => handleSetDriverProfile(profile)}
                className={`mr-2 mb-2 px-4 py-2 rounded-md text-white ${currentBusState?.driverProfile === profile ? 'bg-blue-600' : 'bg-blue-400'} hover:bg-blue-500`}
                disabled={isLoading}
              >
                {profile.charAt(0).toUpperCase() + profile.slice(1)}
              </button>
            ))}
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Arıza Enjekte Et</h3>
            <button
              onClick={() => handleInjectFault('battery_overheat', 0.2)}
              className="mr-2 mb-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              disabled={isLoading}
            >
              Batarya Aşırı Isınma
            </button>
            <button
              onClick={() => handleInjectFault('motor_insulation_degradation', 0.2)}
              className="mr-2 mb-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              disabled={isLoading}
            >
              Motor İzolasyon Hatası
            </button>
            <button
              onClick={() => handleInjectFault('tire_pressure_loss', 0.1)}
              className="mr-2 mb-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              disabled={isLoading}
            >
              Lastik Basıncı Düşük
            </button>
            <button
              onClick={() => handleInjectFault('coolant_pump_failure', 0.1)}
              className="mr-2 mb-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              disabled={isLoading}
            >
              Soğutma Pompası Arızası
            </button>
            <button
              onClick={() =>
                handleInjectFault('sensor_frozen', 0.5, true, 30, 5, { sensor: 'motorTemperature' })
              }
              className="mr-2 mb-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
              disabled={isLoading}
            >
              Sensör Donma (Motor Temp)
            </button>
            <button
              onClick={() =>
                handleInjectFault('sensor_noisy', 0.5, true, 40, 10, { sensor: 'batteryCurrent' })
              }
              className="mr-2 mb-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
              disabled={isLoading}
            >
              Sensör Gürültülü (Batarya Akım)
            </button>
            <button
              onClick={handleClearFaults}
              className="mr-2 mb-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              disabled={isLoading}
            >
              Tüm Arızaları Temizle
            </button>
          </div>
        </div>
      </div>

      {/* Anlık Otobüs Durumu */}
      {currentBusState && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-3">
            Anlık Otobüs Durumu: {currentBusState.busId}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            {/* General Status */}
            <div className="col-span-full md:col-span-1 border-b pb-2 mb-2">
              <h3 className="font-semibold text-md mb-1">Genel Durum</h3>
              <p>
                <strong>Hız:</strong> {currentBusState.vehicleSpeed} km/s
              </p>
              <p>
                <strong>Katedilen Mesafe:</strong> {currentBusState.totalDistanceKm} km
              </p>
              <p>
                <strong>Şarjda mı:</strong>{' '}
                {currentBusState.chargingStatus ? (
                  <span className="text-green-500">Evet</span>
                ) : (
                  <span className="text-red-500">Hayır</span>
                )}
              </p>
              <p>
                <strong>Sağlık Durumu:</strong>{' '}
                <span
                  className={
                    currentBusState.healthStatus !== 'normal_calisma'
                      ? 'text-red-500 font-bold'
                      : 'text-green-500'
                  }
                >
                  {currentBusState.healthStatus}
                </span>
              </p>
              <p>
                <strong>Arıza Kodu:</strong> {currentBusState.errorCode || 'Yok'}
              </p>
              <p>
                <strong>Eğim:</strong> {currentBusState.current_slope_degrees}°
              </p>
            </div>

            {/* Motor & Güç */}
            <div className="col-span-full md:col-span-1 border-b pb-2 mb-2">
              <h3 className="font-semibold text-md mb-1">Motor & Güç</h3>
              <p>
                <strong>Motor Devri:</strong> {currentBusState.motorRPM} RPM
              </p>
              <p>
                <strong>Motor Akımı:</strong> {currentBusState.motorCurrent} A
              </p>
              <p>
                <strong>Motor Voltajı:</strong> {currentBusState.motorVoltage} V
              </p>
              <p>
                <strong>Motor Sıcaklığı:</strong> {currentBusState.motorTemperature}°C
              </p>
              <p>
                <strong>Rejeneratif Frenleme:</strong> {currentBusState.regenBrakePower} kW
              </p>
            </div>

            {/* Batarya Durumu */}
            <div className="col-span-full md:col-span-1 border-b pb-2 mb-2">
              <h3 className="font-semibold text-md mb-1">Batarya Durumu</h3>
              <p>
                <strong>SOC:</strong> {currentBusState.batterySOC}%
              </p>
              <p>
                <strong>Batarya Voltajı:</strong> {currentBusState.batteryVoltage} V
              </p>
              <p>
                <strong>Batarya Akımı:</strong> {currentBusState.batteryCurrent} A
              </p>
              <p>
                <strong>Min Batarya Sıcaklığı:</strong> {currentBusState.batteryTempMin}°C
              </p>
              <p>
                <strong>Max Batarya Sıcaklığı:</strong> {currentBusState.batteryTempMax}°C
              </p>
              <p>
                <strong>Batarya Sağlığı:</strong> {currentBusState.batteryHealth}%
              </p>
            </div>

            {/* Çevresel & Sürücü */}
            <div className="col-span-full md:col-span-1 border-b pb-2 mb-2">
              <h3 className="font-semibold text-md mb-1">Çevre & Sürücü</h3>
              <p>
                <strong>Dış Ortam Sıcaklığı:</strong> {currentBusState.ambientTemperature}°C
              </p>
              <p>
                <strong>Hava Durumu:</strong> {currentBusState.weatherCondition}
              </p>
              <p>
                <strong>Rüzgar Hızı:</strong> {currentBusState.windSpeedMps} m/s
              </p>
              <p>
                <strong>Sürücü Profili:</strong> {currentBusState.driverProfile}
              </p>
              <p>
                <strong>Hız Sabitleyici:</strong>{' '}
                {currentBusState.cruiseControlActive ? 'Aktif' : 'Pasif'}
              </p>
              <p>
                <strong>Trafik Yoğunluğu:</strong> {currentBusState.current_traffic_density}
              </p>
            </div>

            {/* Diğer Sensörler */}
            <div className="col-span-full md:col-span-1 border-b pb-2 mb-2">
              <h3 className="font-semibold text-md mb-1">Diğer Sensörler</h3>
              <p>
                <strong>Lastik Basıncı:</strong> {currentBusState.tirePressure} PSI
              </p>
              <p>
                <strong>Yardımcı Akü Voltajı:</strong> {currentBusState.auxBatteryVoltage} V
              </p>
              <p>
                <strong>Soğutma Suyu Sıcaklığı:</strong> {currentBusState.coolantTemp}°C
              </p>
              <p>
                <strong>Vites:</strong> {currentBusState.gear}
              </p>
              <p>
                <strong>Fren Pedalı Aktif:</strong>{' '}
                {currentBusState.brakePedalActive ? 'Evet' : 'Hayır'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grafik Alanı */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6 bg-white p-4 rounded-lg shadow-md">
        <LineChart
          title="Hız (km/s) vs Hız Limiti"
          labels={labels}
          data={speedData}
          borderColor="rgb(75, 192, 192)"
          yAxisLabel="Hız (km/s)"
          min={0}
          max={100}
        />
        <LineChart
          title="Batarya SOC (%)"
          labels={labels}
          data={socData}
          borderColor="rgb(50, 205, 50)"
          yAxisLabel="SOC (%)"
          min={0}
          max={100}
        />
        <LineChart
          title="Sıcaklıklar (°C)"
          labels={labels}
          data={{
            'Motor Sıcaklığı': motorTempData,
            'Batarya Max Sıcaklığı': batteryTempMaxData,
            'Ortam Sıcaklığı': ambientTempData,
            'Soğutma Suyu Sıcaklığı': coolantTempData,
          }}
          borderColor={{
            'Motor Sıcaklığı': 'rgb(255, 99, 132)',
            'Batarya Max Sıcaklığı': 'rgb(153, 102, 255)',
            'Ortam Sıcaklığı': 'rgb(255, 159, 64)',
            'Soğutma Suyu Sıcaklığı': 'rgb(0, 128, 255)',
          }}
          yAxisLabel="Sıcaklık (°C)"
          min={-10}
          max={150}
        />
        <LineChart
          title="Basınçlar ve Voltajlar"
          labels={labels}
          data={{
            'Lastik Basıncı (PSI)': tirePressureData,
            'Yardımcı Akü Voltajı (V)': auxBatteryVoltageData,
          }}
          borderColor={{
            'Lastik Basıncı (PSI)': 'rgb(201, 203, 207)',
            'Yardımcı Akü Voltajı (V)': 'rgb(255, 205, 86)',
          }}
          yAxisLabel="Değer"
          min={0}
          max={100}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
