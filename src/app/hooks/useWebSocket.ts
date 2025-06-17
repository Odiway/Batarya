import { useState, useEffect, useRef, useCallback } from 'react';

// Veri yapısı için bir interface tanımlayalım (Python'dan gelen JSON'a göre)
// Bu interface'i Python'dan gelen tüm olası alanlarla güncel tutun.
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
  tirePressure: number; // Yeni eklendi

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
  bmsFaultActive: boolean; // Yeni eklendi

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

// Mesaj yapısı için interface (Python'a komut göndermek için)
interface WebSocketMessage {
  type: string;
  profile?: string; // set_driver_profile için
  fault_type?: string; // inject_fault için
  severity_start?: number; // inject_fault için
  intermittent?: boolean; // inject_fault için
  intermittent_interval_s?: number; // inject_fault için
  intermittent_duration_s?: number; // inject_fault için
  details?: { [key: string]: any }; // inject_fault için (sensör arızaları)
  // clear_faults için ek parametre yok
}

const useWebSocket = (url: string) => {
  const [data, setData] = useState<BusData | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not open. Message not sent:', message);
    }
  }, []);

  useEffect(() => {
    // WebSocket bağlantısını aç
    // Not: Kendi kendine imzalı sertifikalar için tarayıcı uyarısı alabilirsiniz.
    // Geliştirme sırasında bu uyarıyı atlamanız gerekebilir (Advanced -> Proceed anyway).
    ws.current = new WebSocket(url); // <-- URL artık "wss://localhost:8765" olacak

    ws.current.onopen = () => {
      console.log('WebSocket connection established.');
      setIsConnected(true);
      setError(null);
    };

    ws.current.onmessage = (event: MessageEvent) => {
      try {
        const parsedData: BusData = JSON.parse(event.data as string);
        // console.log("Received data from WebSocket:", parsedData); // Konsol gürültüsünü azaltmak için kapatıldı
        setData(parsedData); // Gelen veriyi state'e kaydet
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e, event.data);
        setError('Failed to parse WebSocket message.');
      }
    };

    ws.current.onerror = (err: Event) => {
      // Event tipi genellikle ErrorEvent'tir
      // Kendi kendine imzalı sertifikalarda bu hata sıkça görünür,
      // genellikle tarayıcı uyarı verir ve kullanıcı "İleri Düzey -> Güvensiz devam et" derse düzelir.
      console.error('WebSocket error:', err);
      setError('WebSocket error occurred. See console for details.');
    };

    ws.current.onclose = (event: CloseEvent) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      setIsConnected(false);
      // Yeniden bağlanma mekanizması eklenebilir
      setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        // Yeniden bağlanma, useEffect'in tekrar çalışmasını tetikler
        // veya doğrudan connectWebSocket() çağrılabilir
        // (Bu hook'ta URL dependency'si olduğu için tekrar deneyecektir)
      }, 3000); // 3 saniye sonra yeniden dene
    };

    // Temizleme fonksiyonu: Bileşen unmount edildiğinde bağlantıyı kapat
    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, [url]); // URL değişirse bağlantıyı yeniden kur

  return { data, isConnected, error, sendMessage };
};

export default useWebSocket;
