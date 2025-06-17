// app/dashboard/page.tsx
'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface SensorData {
  _id: string;
  timestamp: string;
  bus_id: string;
  cell_voltage: number;
  cell_min_temp: number;
  cell_max_temp: number;
  energy_efficiency: number;
  current_driving_mode: string;
  battery_soh: number;
  current_fault_type: string;
  receivedAt: string;
}

interface PredictionData {
  _id: string;
  bus_id: string;
  timestamp_data_end: string;
  predicted_at: string;
  fault_type: string;
  fault_reason: string;
  prob_5min: number;
  prob_30min: number;
  is_fault_imminent_5min: boolean;
  is_fault_imminent_30min: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const busImages: { [key: string]: string } = {
  BUS001: '/images/bus001.png',
  BUS002: '/images/bus002.png',
};

export default function Dashboard() {
  const { data: sensorData, error: sensorError } = useSWR<SensorData[]>('/api/can-data', fetcher, {
    refreshInterval: 5000,
  });

  const { data: predictionData, error: predictionError } = useSWR<PredictionData[]>(
    '/api/predictions',
    fetcher,
    {
      refreshInterval: 10000,
    },
  );

  // useMemo hook'larını koşulsuz olarak çağırın ve verinin null/undefined olma durumunu içlerinde ele alın
  const busSensorData: { [key: string]: SensorData[] } = useMemo(() => {
    const groupedData: { [key: string]: SensorData[] } = {};
    if (sensorData) {
      // Veri varsa işlem yap
      sensorData.forEach((d) => {
        if (!groupedData[d.bus_id]) {
          groupedData[d.bus_id] = [];
        }
        groupedData[d.bus_id].push(d);
      });
      Object.keys(groupedData).forEach((busId) => {
        groupedData[busId].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );
      });
    }
    return groupedData;
  }, [sensorData]); // Bağımlılık sadece sensorData

  const busPredictionData: { [key: string]: PredictionData[] } = useMemo(() => {
    const groupedData: { [key: string]: PredictionData[] } = {};
    if (predictionData) {
      // Veri varsa işlem yap
      predictionData.forEach((p) => {
        if (!groupedData[p.bus_id]) {
          groupedData[p.bus_id] = [];
        }
        groupedData[p.bus_id].push(p);
      });
      Object.keys(groupedData).forEach((busId) => {
        groupedData[busId].sort(
          (a, b) => new Date(b.predicted_at).getTime() - new Date(a.predicted_at).getTime(),
        );
      });
    }
    return groupedData;
  }, [predictionData]); // Bağımlılık sadece predictionData

  if (sensorError || predictionError) {
    console.error('Veri yükleme hatası:', sensorError || predictionError);
    return (
      <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
        Veriler yüklenirken bir hata oluştu. Lütfen konsolu kontrol edin.
      </div>
    );
  }

  // Verilerin yüklenip yüklenmediğini kontrol eden blok
  if (!sensorData || !predictionData || Object.keys(busSensorData).length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em', color: '#555' }}>
        Veriler yükleniyor... Lütfen simülatör ve yapay zeka tahmin servislerinin çalıştığından emin
        olun.
      </div>
    );
  }

  const getChartData = (
    busId: string,
    label: string,
    sensorKey: keyof SensorData,
    color: string,
  ) => {
    const dataPoints = busSensorData[busId] || [];
    const sortedData = dataPoints.slice(-60);

    return {
      labels: sortedData.map((d) => new Date(d.timestamp).toLocaleTimeString()),
      datasets: [
        {
          label: label,
          data: sortedData.map((d) => d[sensorKey]),
          fill: false,
          borderColor: color,
          tension: 0.1,
          pointRadius: 2,
          pointHoverRadius: 5,
        },
      ],
    };
  };

  const getChartOptions = (title: string, yAxisLabel: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Zaman',
          font: {
            size: 14,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: yAxisLabel,
          font: {
            size: 14,
          },
        },
      },
    },
  });

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f0f2f5',
        minHeight: '100vh',
      }}
    >
      <h1 style={{ color: '#333', textAlign: 'center', marginBottom: '30px', fontSize: '2.5em' }}>
        Temsa Otobüs Kestirimci Bakım Kontrol Paneli
      </h1>

      {Object.keys(busSensorData).map((busId) => {
        const currentBusSensorData = busSensorData[busId] || [];
        const firstTimestamp =
          currentBusSensorData.length > 0 ? new Date(currentBusSensorData[0].timestamp) : null;
        const lastTimestamp =
          currentBusSensorData.length > 0
            ? new Date(currentBusSensorData[currentBusSensorData.length - 1].timestamp)
            : null;

        let dataCollectionDuration = 'N/A';
        if (firstTimestamp && lastTimestamp) {
          const durationMs = lastTimestamp.getTime() - firstTimestamp.getTime();
          const minutes = Math.floor(durationMs / (1000 * 60));
          const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
          dataCollectionDuration = `${minutes}dk ${seconds}sn`;
        }

        return (
          <div
            key={busId}
            style={{
              backgroundColor: '#fff',
              padding: '30px',
              borderRadius: '10px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '3px solid #007bff',
                paddingBottom: '15px',
                marginBottom: '30px',
              }}
            >
              <h2 style={{ color: '#007bff', fontSize: '2em', margin: 0 }}>Otobüs ID: {busId}</h2>
              {busImages[busId] && (
                <Image
                  src={busImages[busId]}
                  alt={`${busId} otobüsü`}
                  width={150}
                  height={100}
                  style={{ borderRadius: '5px', objectFit: 'cover' }}
                />
              )}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                padding: '15px 0',
                borderBottom: '1px solid #eee',
                marginBottom: '20px',
                backgroundColor: '#f5f5f5',
                borderRadius: '5px',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#555' }}>Toplam Veri Noktası</h3>
                <p style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#333' }}>
                  {currentBusSensorData.length}
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#555' }}>Veri Toplama Süresi</h3>
                <p style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#333' }}>
                  {dataCollectionDuration}
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '25px',
                marginBottom: '40px',
              }}
            >
              {busPredictionData[busId] && busPredictionData[busId].length > 0 ? (
                busPredictionData[busId].slice(0, 1).map((pred, index) => {
                  let statusColor = '#4CAF50';
                  let statusText = 'Normal Çalışıyor';
                  if (pred.is_fault_imminent_30min) {
                    statusColor = '#D32F2F';
                    statusText = 'Kritik Arıza Riski!';
                  } else if (pred.is_fault_imminent_5min) {
                    statusColor = '#FFC107';
                    statusText = 'Yakın Arıza Riski!';
                  }

                  const latestSensorInfo =
                    currentBusSensorData.length > 0
                      ? currentBusSensorData[currentBusSensorData.length - 1]
                      : null;

                  return (
                    <div
                      key={index}
                      style={{
                        padding: '20px',
                        borderRadius: '8px',
                        backgroundColor:
                          statusColor === '#D32F2F'
                            ? '#ffebee'
                            : statusColor === '#FFC107'
                              ? '#fff8e1'
                              : '#e8f5e9',
                        border: `2px solid ${statusColor}`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '1.5em' }}>
                        Kestirimci Bakım Durumu
                      </h3>
                      <p style={{ fontSize: '1.1em', marginBottom: '8px' }}>
                        <strong>Durum:</strong>{' '}
                        <span style={{ fontWeight: 'bold', color: statusColor }}>{statusText}</span>
                      </p>
                      <p style={{ fontSize: '1.1em', marginBottom: '8px' }}>
                        <strong>Tahmin Zamanı:</strong>{' '}
                        {new Date(pred.predicted_at).toLocaleString()}
                      </p>
                      <p style={{ fontSize: '1.1em', marginBottom: '8px' }}>
                        <strong>Olası Arıza Tipi:</strong>{' '}
                        <span style={{ fontWeight: 'bold' }}>{pred.fault_type}</span>
                      </p>
                      <p style={{ fontSize: '1.1em', marginBottom: '8px' }}>
                        <strong>Arıza Nedeni:</strong> {pred.fault_reason}
                      </p>
                      <p style={{ fontSize: '1.1em', marginBottom: '8px' }}>
                        <strong>5 Dakika Sonra Risk:</strong>{' '}
                        <span
                          style={{
                            fontWeight: 'bold',
                            color: pred.is_fault_imminent_5min ? 'orange' : 'green',
                          }}
                        >
                          {pred.is_fault_imminent_5min ? 'Yüksek' : 'Düşük'} (
                          {Math.round(pred.prob_5min * 100)}%)
                        </span>
                      </p>
                      <p style={{ fontSize: '1.1em' }}>
                        <strong>30 Dakika Sonra Risk:</strong>{' '}
                        <span
                          style={{
                            fontWeight: 'bold',
                            color: pred.is_fault_imminent_30min ? 'red' : 'green',
                          }}
                        >
                          {pred.is_fault_imminent_30min ? 'Çok Yüksek' : 'Düşük'} (
                          {Math.round(pred.prob_30min * 100)}%)
                        </span>
                      </p>
                      {latestSensorInfo && (
                        <div
                          style={{
                            marginTop: '15px',
                            paddingTop: '15px',
                            borderTop: '1px dashed #ccc',
                          }}
                        >
                          <h4 style={{ marginBottom: '10px', color: '#555' }}>
                            Son Anlık Veriler:
                          </h4>
                          <p>
                            <strong>Mod:</strong> {latestSensorInfo.current_driving_mode}
                          </p>
                          <p>
                            <strong>SOH:</strong> %{latestSensorInfo.battery_soh}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    padding: '20px',
                    borderRadius: '8px',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ccc',
                  }}
                >
                  <p>
                    Bu otobüs için henüz tahmin verisi yok. Yapay Zeka tahmin servisini
                    çalıştığından emin olun.
                  </p>
                </div>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
                gap: '25px',
              }}
            >
              <div
                style={{
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#f9f9f9',
                  height: '400px',
                }}
              >
                <Line
                  data={getChartData(busId, 'Hücre Voltajı (V)', 'cell_voltage', '#4285F4')}
                  options={getChartOptions('Hücre Voltajı Değişimi', 'Voltaj (V)')}
                />
              </div>
              <div
                style={{
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#f9f9f9',
                  height: '400px',
                }}
              >
                <Line
                  data={getChartData(
                    busId,
                    'Maks. Hücre Sıcaklığı (°C)',
                    'cell_max_temp',
                    '#EA4335',
                  )}
                  options={getChartOptions('Maksimum Hücre Sıcaklığı Değişimi', 'Sıcaklık (°C)')}
                />
              </div>
              <div
                style={{
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#f9f9f9',
                  height: '400px',
                }}
              >
                <Line
                  data={getChartData(
                    busId,
                    'Min. Hücre Sıcaklığı (°C)',
                    'cell_min_temp',
                    '#34A853',
                  )}
                  options={getChartOptions('Minimum Hücre Sıcaklığı Değişimi', 'Sıcaklık (°C)')}
                />
              </div>
              <div
                style={{
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#f9f9f9',
                  height: '400px',
                }}
              >
                <Line
                  data={getChartData(
                    busId,
                    'Enerji Verimliliği (%)',
                    'energy_efficiency',
                    '#FBBC05',
                  )}
                  options={getChartOptions('Enerji Verimliliği Değişimi', 'Verimlilik (%)')}
                />
              </div>
              <div
                style={{
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#f9f9f9',
                  height: '400px',
                }}
              >
                <Line
                  data={getChartData(busId, 'Batarya Sağlığı (SOH %)', 'battery_soh', '#673AB7')}
                  options={getChartOptions('Batarya Sağlığı Değişimi (SOH)', 'SOH (%)')}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
