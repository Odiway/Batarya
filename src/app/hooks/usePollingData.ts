import { useState, useEffect, useRef } from 'react';

// Python'dan gelen veri yapısını (BusData) buraya kopyalayın
interface BusData {
  busId: string;
  timestamp: string;
  vehicleSpeed: number;
  totalDistanceKm: number;
  brakePedalActive: boolean;
  regenBrakePower: number;
  gear: string;
  auxBatteryVoltage: number;
  cabinTemp: number;
  chargingStatus: boolean;
  tirePressure: number;

  motorRPM: number;
  motorCurrent: number;
  motorVoltage: number;
  motorTemperature: number;

  batterySOC: number;
  batteryVoltage: number;
  batteryCurrent: number;
  batteryTempMin: number;
  batteryTempMax: number;
  batteryHealth: number;
  bmsFaultActive: boolean;

  ambientTemperature: number;
  weatherCondition: string;
  windSpeedMps: number;
  humidity: number;

  current_slope_degrees: number;
  current_speed_limit_kph: number;
  current_traffic_density: string;
  current_route_action: string;
  current_segment_index: number;
  distance_in_current_segment_km: number;

  driverProfile: string;
  cruiseControlActive: boolean;
  driverTargetSpeed: number;

  healthStatus: string;
  errorCode: string | null;
}

interface PollingOptions {
  intervalMs?: number; // Sorgulama aralığı (milisaniye)
  initialData?: BusData[]; // Başlangıçta yüklenecek veri (opsiyonel)
}

const usePollingData = (url: string, options?: PollingOptions) => {
  const { intervalMs = 500, initialData = [] } = options || {}; // Varsayılan 500ms
  const [data, setData] = useState<BusData[]>(initialData); // Tüm çekilen veriyi tutar
  const [latestData, setLatestData] = useState<BusData | null>(null); // En son gelen tek veri noktasını tutar
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true); // Bileşenin mount durumunu takip etmek için

  const fetchData = async () => {
    if (!isMounted.current) return; // Bileşen unmount edilmişse veri çekme

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const fetchedData: BusData[] = await response.json();

      if (isMounted.current) {
        // Fetch sonrası tekrar mount kontrolü
        setData(fetchedData);
        if (fetchedData.length > 0) {
          // MongoDB'den en yeni kayıt en üstte gelir (sort({ timestamp: -1 }) nedeniyle)
          setLatestData(fetchedData[0]);
        } else {
          setLatestData(null);
        }
      }
    } catch (e: any) {
      if (isMounted.current) {
        console.error('Error fetching data:', e);
        setError(`Veri çekme hatası: ${e.message}`);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true; // Bileşen mount edildiğinde true yap
    fetchData(); // Bileşen yüklendiğinde ilk çekimi yap

    const intervalId = setInterval(fetchData, intervalMs); // Belirlenen aralıklarla çek

    return () => {
      isMounted.current = false; // Bileşen unmount edildiğinde false yap
      clearInterval(intervalId); // Interval'i temizle
    };
  }, [url, intervalMs]); // URL veya intervalMs değişirse yeniden başlat

  // WebSocket hook'undaki gibi bir sendMessage fonksiyonuna ihtiyacımız yok
  // Polling tek yönlü (çekme) bir iletişim olduğu için.
  // Eğer komut göndermek istersek, ayrı bir fetch/POST isteği yaparız.
  // Polling sisteminde 'isConnected' durumu 'isLoading' ile birleşebilir.
  // Şu an için her zaman bağlı varsayabiliriz, hata yoksa.
  const isConnected = !error; // Hata yoksa bağlı varsay

  return { data, latestData, isLoading, error, isConnected };
};

export default usePollingData;
