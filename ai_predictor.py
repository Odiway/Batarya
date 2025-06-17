# ai_predictor.py
import time
import requests
from datetime import datetime, timedelta
import numpy as np
import pandas as pd # Pandas importunu ekledik
import joblib

# Modelinizin kaydedildiği dosya yolu
MODEL_PATH = "battery_fault_predictor_models.pkl" # models.pkl olarak değiştirdik

# Next.js API'den veri çekecek URL
NEXTJS_GET_DATA_URL = "http://localhost:3000/api/can-data"
# Tahmin sonuçlarını Next.js API'ye gönderecek URL
NEXTJS_POST_PREDICTION_URL = "http://localhost:3000/api/predictions"

# --- Model Yükleme ---
loaded_models = None
model_5min = None
model_30min = None
model_fault_type = None
features_cols = None
fault_type_map_text = None # fault_type_map'i metin karşılıklarını almak için

try:
    loaded_models = joblib.load(MODEL_PATH)
    model_5min = loaded_models.get('model_5min')
    model_30min = loaded_models.get('model_30min')
    model_fault_type = loaded_models.get('model_fault_type')
    features_cols = loaded_models.get('features_cols')
    fault_type_map_text = loaded_models.get('fault_type_map') # Metin karşılıklarını yüklüyoruz
    print("Yapay Zeka Modelleri başarıyla yüklendi.")
    if not model_5min or not model_30min or not model_fault_type or not features_cols:
        print("Uyarı: Yüklenen model dosyasında bazı modeller/özellikler eksik.")
except FileNotFoundError:
    print(f"Hata: {MODEL_PATH} bulunamadı. Lütfen 'train_model.py' scriptini çalıştırın ve modeli eğitin.")
except Exception as e:
    print(f"Model yüklenirken bir hata oluştu: {e}")

# --- Özellik Mühendisliği Fonksiyonu ---
def create_features(data_points_df):
    # Bu fonksiyon, pandas DataFrame olarak gelen son N veri noktasından anlamlı özellikler çıkarır.
    # train_model.py ile tamamen aynı olmalı.

    if data_points_df.empty or len(data_points_df) < 60: # En az 5 dakikalık (60 veri noktası) geçmiş veri
        return None

    window_size = 60 # train_model.py ile aynı

    # Özellik Mühendisliği
    data_points_df['voltage_mean'] = data_points_df['cell_voltage'].rolling(window=window_size).mean()
    data_points_df['voltage_std'] = data_points_df['cell_voltage'].rolling(window=window_size).std()
    data_points_df['max_temp_mean'] = data_points_df['cell_max_temp'].rolling(window=window_size).mean()
    data_points_df['max_temp_std'] = data_points_df['cell_max_temp'].rolling(window=window_size).std()
    data_points_df['min_temp_mean'] = data_points_df['cell_min_temp'].rolling(window=window_size).mean()
    data_points_df['min_temp_std'] = data_points_df['cell_min_temp'].rolling(window=window_size).std()
    data_points_df['temp_diff_mean'] = (data_points_df['cell_max_temp'] - data_points_df['cell_min_temp']).rolling(window=window_size).mean()
    data_points_df['efficiency_mean'] = data_points_df['energy_efficiency'].rolling(window=window_size).mean()
    data_points_df['efficiency_std'] = data_points_df['energy_efficiency'].rolling(window=window_size).std()
    
    # SOH doğrudan özellik olarak
    # battery_soh zaten df'de mevcut. Son değeri alacağız.

    # Kategorik sürüş modunu One-Hot Encoding yap (train_model.py ile aynı sütunlar oluşmalı)
    # df.columns'daki mevcut mod sütunlarını yakalamak ve eksik olanları eklemek önemli
    # train_model.py'deki tüm mod_dummy sütunlarını bilmeliyiz.
    all_possible_modes = ['mode_idle', 'mode_accelerating', 'mode_cruising', 'mode_braking', 'mode_uphill', 'mode_downhill']
    mode_dummies = pd.get_dummies(data_points_df['current_driving_mode'], prefix='mode', dummy_na=False)
    
    # Eksik sütunları ekle ve NaN'ları 0 ile doldur
    for col in all_possible_modes:
        if col not in mode_dummies.columns:
            mode_dummies[col] = 0
    mode_dummies = mode_dummies[all_possible_modes] # Sırayı koru

    data_points_df = pd.concat([data_points_df, mode_dummies], axis=1)

    # Son satırdaki özellikler kullanılacak
    latest_features_row = data_points_df.iloc[-1]

    # Eğitilen modelin beklediği özellik sütunlarının sırasını ve adlarını kullan
    if features_cols is None or not all(col in latest_features_row for col in features_cols):
        print("Uyarı: Özellik sütunları eksik veya modelin beklediği formatta değil.")
        return None

    # Modellerin beklediği sıraya göre numpy array oluştur
    # latest_features_row[features_cols] kullanarak sadece ilgili sütunları ve doğru sırayı alırız
    return np.array(latest_features_row[features_cols]).reshape(1, -1)


# --- Tahmin Yapma Fonksiyonu ---
def make_prediction(features):
    predictions_output = {
        "fault_type": "Bilinmiyor",
        "fault_reason": "Model yüklenemedi veya yeterli veri yok.",
        "prob_5min": 0.0,
        "prob_30min": 0.0,
        "is_fault_imminent_5min": False,
        "is_fault_imminent_30min": False
    }

    if features is None:
        return predictions_output # Özellik çıkarılamadıysa boş dön

    # 5 dakikalık tahmin
    if model_5min:
        prob_5min = model_5min.predict_proba(features)[0][1] # Genellikle 1. sınıf (arıza) olasılığı
        predictions_output["prob_5min"] = round(prob_5min, 4)
        predictions_output["is_fault_imminent_5min"] = prob_5min > 0.5 # Eşik değeri

    # 30 dakikalık tahmin
    if model_30min:
        prob_30min = model_30min.predict_proba(features)[0][1] # Genellikle 1. sınıf (arıza) olasılığı
        predictions_output["prob_30min"] = round(prob_30min, 4)
        predictions_output["is_fault_imminent_30min"] = prob_30min > 0.5 # Eşik değeri

    # Arıza tipi tahmini
    if model_fault_type and fault_type_map_text:
        fault_type_pred_idx = model_fault_type.predict(features)[0]
        predictions_output["fault_type"] = fault_type_map_text[fault_type_pred_idx]

        # Arıza nedenini tahmin edilen türe göre güncelleyin
        if predictions_output["fault_type"] == "voltage_drop_fault":
            predictions_output["fault_reason"] = "Hücre voltajında kritik düşüş eğilimi."
        elif predictions_output["fault_type"] == "overheat_fault":
            predictions_output["fault_reason"] = "Pil paketi sıcaklığı tehlikeli seviyede."
        elif predictions_output["fault_type"] == "efficiency_loss_fault":
            predictions_output["fault_reason"] = "Enerji verimliliğinde belirgin düşüş."
        elif predictions_output["fault_type"] == "cell_imbalance_fault":
            predictions_output["fault_reason"] = "Hücreler arası denge bozukluğu tespit edildi."
        elif predictions_output["fault_type"] == "capacity_loss_fault":
            predictions_output["fault_reason"] = "Batarya kapasitesinde ciddi bir kayıp var."
        else: # Normal
            predictions_output["fault_reason"] = "Sistem normal çalışıyor veya belirgin bir arıza riski yok."
    
    return predictions_output


# --- Tahmin Sonuçlarını Kaydetme Fonksiyonu ---
def post_prediction(prediction_data):
    try:
        response = requests.post(NEXTJS_POST_PREDICTION_URL, json=prediction_data)
        response.raise_for_status()
        # print(f"Prediction sent for {prediction_data['bus_id']}: {response.status_code}") # Gürültüyü azaltmak için yorum satırı
    except requests.exceptions.RequestException as e:
        print(f"Error sending prediction to Next.js: {e}")

# --- Ana Tahmin Döngüsü ---
if __name__ == "__main__":
    print("Yapay Zeka tahmin servisi başlatılıyor...")
    
    while True:
        try:
            # Next.js API'sinden en güncel verileri çek
            # Bu çağrı, API'den her otobüs için en son N adet veriyi çekmelidir (varsayılan 500)
            response = requests.get(NEXTJS_GET_DATA_URL)
            response.raise_for_status()
            all_latest_data = response.json()

            if not all_latest_data:
                print("Veritabanında henüz veri yok, bekleniyor...")
                time.sleep(10)
                continue

            # Verileri otobüs ID'sine göre gruplayalım
            bus_data_groups = {}
            for data_point in all_latest_data:
                bus_id = data_point.get("bus_id")
                if bus_id not in bus_data_groups:
                    bus_data_groups[bus_id] = []
                # Zaman damgasını datetime objesine çevirerek ekle, bu sorting için önemli
                data_point['timestamp_dt'] = datetime.fromisoformat(data_point['timestamp'].replace('Z', '+00:00'))
                bus_data_groups[bus_id].append(data_point)
            
            # Her otobüs için analiz yap
            for bus_id, data_points in bus_data_groups.items():
                # Verileri zaman damgasına göre sırala (en eskiden en yeniye)
                sorted_data_points = sorted(data_points, key=lambda x: x['timestamp_dt'])
                
                # DataFrame'e dönüştür
                df_bus = pd.DataFrame(sorted_data_points)

                features = create_features(df_bus)
                if features is not None:
                    prediction_result = make_prediction(features)
                    
                    prediction_record = {
                        "bus_id": bus_id,
                        "timestamp_data_end": sorted_data_points[-1]['timestamp'], # Analiz edilen son verinin zamanı
                        "predicted_at": datetime.now().isoformat(),
                        "fault_type": prediction_result["fault_type"],
                        "fault_reason": prediction_result["fault_reason"],
                        "prob_5min": prediction_result["prob_5min"],
                        "prob_30min": prediction_result["prob_30min"],
                        "is_fault_imminent_5min": prediction_result["is_fault_imminent_5min"],
                        "is_fault_imminent_30min": prediction_result["is_fault_imminent_30min"]
                    }
                    post_prediction(prediction_record)
                else:
                    print(f"Otobüs {bus_id} için yeterli veri yok veya özellik çıkarılamadı, analiz atlandı.")

        except requests.exceptions.RequestException as e:
            print(f"Next.js API'sinden veri çekilirken hata oluştu: {e}")
        except Exception as e:
            print(f"Genel bir hata oluştu: {e}")
            
        time.sleep(10) # Her 10 saniyede bir analiz yap