# train_model.py
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib
import requests
from datetime import datetime, timedelta

# Next.js API'den geçmiş verileri çekmek için URL
NEXTJS_GET_DATA_URL = "http://localhost:3000/api/can-data"
MODEL_SAVE_PATH = "battery_fault_predictor_models.pkl" # Çoğul isim verdik, birden fazla model kaydediyoruz

# Simülatördeki ve modeldeki arıza tipleri ile aynı olmalı
# Sıra önemlidir, bu indeksler one-hot encoding ve fault_type_map için kullanılacaktır.
FAULT_TYPES = ["normal", "voltage_drop_fault", "overheat_fault", "efficiency_loss_fault", "cell_imbalance_fault", "capacity_loss_fault"]
FAULT_TYPE_MAP = {fault_type: i for i, fault_type in enumerate(FAULT_TYPES)}

# Simülatördeki sürüş modları ile aynı olmalı
DRIVING_MODES = ['idle', 'accelerating', 'cruising', 'braking', 'uphill', 'downhill']
# One-Hot Encoding sonrası oluşacak sütun isimleri
MODE_COLUMNS = [f'mode_{mode}' for mode in DRIVING_MODES]


def fetch_all_data():
    # API'den tüm geçmiş veriyi çekmek için, API'deki limiti artırmak veya pagination kullanmak gerekebilir.
    # Varsayılan Next.js API'miz 500 veri çekiyor. Daha fazla veri için App Router route.js'deki limiti değiştirin.
    try:
        response = requests.get(NEXTJS_GET_DATA_URL)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Veri çekilirken hata oluştu: {e}")
        return []

def preprocess_and_label_data(data):
    df = pd.DataFrame(data)
    if df.empty:
        print("Uyarı: İşlenecek veri yok. Simülatörün veri gönderdiğinden emin olun.")
        return None

    # Zaman damgasını datetime objesine çevir ve bus_id ile zamana göre sırala
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values(by=['bus_id', 'timestamp']).reset_index(drop=True)

    # Özellik mühendisliği için pencere boyutu
    # Simülatör 5 saniyede bir veri gönderiyor, 5 dakika = 60 veri noktası
    window_size = 60 # Son 5 dakikalık veriyi kullanacağız (5s * 60 = 300s = 5dk)

    processed_dfs = []
    for bus_id in df['bus_id'].unique():
        bus_df = df[df['bus_id'] == bus_id].copy()

        # Yeterli veri noktası yoksa bu otobüsü atla
        if len(bus_df) < window_size + 360: # En az 30 dk + 5 dk veri (360 + 60)
            # print(f"Uyarı: Otobüs {bus_id} için yeterli veri yok ({len(bus_df)} < {window_size + 360}), atlanıyor.")
            continue

        # Özellik Mühendisliği (Rolling Window Features)
        bus_df['voltage_mean'] = bus_df['cell_voltage'].rolling(window=window_size).mean()
        bus_df['voltage_std'] = bus_df['cell_voltage'].rolling(window=window_size).std()
        bus_df['max_temp_mean'] = bus_df['cell_max_temp'].rolling(window=window_size).mean()
        bus_df['max_temp_std'] = bus_df['cell_max_temp'].rolling(window=window_size).std()
        bus_df['min_temp_mean'] = bus_df['cell_min_temp'].rolling(window=window_size).mean()
        bus_df['min_temp_std'] = bus_df['cell_min_temp'].rolling(window=window_size).std()
        bus_df['temp_diff_mean'] = (bus_df['cell_max_temp'] - bus_df['cell_min_temp']).rolling(window=window_size).mean()
        bus_df['efficiency_mean'] = bus_df['energy_efficiency'].rolling(window=window_size).mean()
        bus_df['efficiency_std'] = bus_df['energy_efficiency'].rolling(window=window_size).std()
        
        # SOH doğrudan özellik olarak kullanılacak
        bus_df['battery_soh_val'] = bus_df['battery_soh'] # Çakışmaması için isim değiştirdik


        # Kategorik sürüş modunu One-Hot Encoding yap
        mode_dummies = pd.get_dummies(bus_df['current_driving_mode'], prefix='mode', dummy_na=False)
        # Olası tüm mod sütunlarının oluştuğundan emin ol (eğitim ve tahmin tutarlılığı için)
        for col in MODE_COLUMNS:
            if col not in mode_dummies.columns:
                mode_dummies[col] = 0
        mode_dummies = mode_dummies[MODE_COLUMNS] # Sırayı koru
        bus_df = pd.concat([bus_df, mode_dummies], axis=1)


        # Arıza Etiketleme (target_5min_fault, target_30min_fault, target_fault_type_id)
        # Simülatördeki 'current_fault_type' bilgisini kullanarak kaydırma (shift) yapıyoruz
        # 5 dakika sonrası (60 adım) ve 30 dakika sonrası (360 adım)
        bus_df['target_5min_fault'] = bus_df['current_fault_type'].shift(-60).apply(lambda x: 1 if x != "normal" else 0)
        bus_df['target_30min_fault'] = bus_df['current_fault_type'].shift(-360).apply(lambda x: 1 if x != "normal" else 0)
        
        # Anlık arıza tipi için sayısal etiketleme
        bus_df['target_fault_type_id'] = bus_df['current_fault_type'].map(FAULT_TYPE_MAP)

        # Eksik değerleri temizle (rolling window ve shift sonrası oluşan NaN'lar)
        bus_df = bus_df.dropna()
        
        processed_dfs.append(bus_df)
    
    if not processed_dfs:
        print("Uyarı: Hiçbir otobüs için yeterli işlenmiş veri bulunamadı.")
        return None

    final_df = pd.concat(processed_dfs)

    # Özellik sütunlarını tanımla
    features_cols = [
        'battery_soh_val', # SOH'un yeni adı
        'voltage_mean', 'voltage_std', 
        'max_temp_mean', 'max_temp_std', 
        'min_temp_mean', 'min_temp_std', 
        'temp_diff_mean', 
        'efficiency_mean', 'efficiency_std'
    ] + MODE_COLUMNS # One-Hot encoded mod sütunlarını ekle
    
    # Hedef değişkenler için gerekli sütunların varlığını kontrol et
    required_targets = ['target_5min_fault', 'target_30min_fault', 'target_fault_type_id']
    if not all(col in final_df.columns for col in required_targets):
        print("Hata: Gerekli hedef sütunları bulunamadı. Etiketleme mantığınızı veya veri miktarını kontrol edin.")
        return None
    
    # Features_cols içinde eksik sütun varsa hata ver veya doldur
    for col in features_cols:
        if col not in final_df.columns:
            print(f"Hata: Özellik sütunu '{col}' DataFrame'de bulunamadı.")
            return None

    X = final_df[features_cols]
    y_5min = final_df['target_5min_fault']
    y_30min = final_df['target_30min_fault']
    y_fault_type = final_df['target_fault_type_id']

    return X, y_5min, y_30min, y_fault_type, features_cols


def train_model():
    print("Model eğitimi için veri çekiliyor...")
    all_data = fetch_all_data()
    
    processed_data = preprocess_and_label_data(all_data)

    if processed_data is None:
        print("Model eğitimi için yeterli veya uygun veri yok. Lütfen simülatörü çalıştırın ve yeterli veri toplandığından emin olun.")
        return

    X, y_5min, y_30min, y_fault_type, features_cols = processed_data
    
    print(f"Eğitim için {len(X)} veri noktası ve {len(features_cols)} özellik hazırlandı.")
    print("Özellikler:", features_cols)
    print("Y_5min dağılımı:\n", y_5min.value_counts())
    print("Y_30min dağılımı:\n", y_30min.value_counts())
    print("Y_fault_type dağılımı:\n", y_fault_type.value_counts())

    # --- Modelleri Eğitme ---

    # 5 dakika sonrası için tahmin modeli
    # Sınıf dengesizliği kontrolü ve stratify kullanımı
    if y_5min.nunique() > 1: # Birden fazla sınıf varsa stratify kullan
        X_train_5min, X_test_5min, y_train_5min, y_test_5min = train_test_split(X, y_5min, test_size=0.2, random_state=42, stratify=y_5min)
        model_5min = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
        model_5min.fit(X_train_5min, y_train_5min)
        predictions_5min = model_5min.predict(X_test_5min)
        print("\n--- 5 Dakika Sonra Arıza Tahmin Modeli Performansı ---")
        # Test setindeki benzersiz etiketleri alın ve FAULT_TYPES'dan karşılıklarını bulun
        labels_in_test_set_5min = np.unique(y_test_5min).tolist()
        current_target_names_5min = ["Normal" if label == 0 else "Arıza" for label in labels_in_test_set_5min]
        print(classification_report(y_test_5min, predictions_5min, labels=labels_in_test_set_5min, target_names=current_target_names_5min, zero_division=0))
    else:
        model_5min = None
        print("Y_5min için tek sınıf var, model eğitilmedi.")


    # 30 dakika sonrası için tahmin modeli
    if y_30min.nunique() > 1:
        X_train_30min, X_test_30min, y_train_30min, y_test_30min = train_test_split(X, y_30min, test_size=0.2, random_state=42, stratify=y_30min)
        model_30min = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
        model_30min.fit(X_train_30min, y_train_30min)
        predictions_30min = model_30min.predict(X_test_30min)
        print("\n--- 30 Dakika Sonra Arıza Tahmin Modeli Performansı ---")
        # Test setindeki benzersiz etiketleri alın
        labels_in_test_set_30min = np.unique(y_test_30min).tolist()
        current_target_names_30min = ["Normal" if label == 0 else "Arıza" for label in labels_in_test_set_30min]
        print(classification_report(y_test_30min, predictions_30min, labels=labels_in_test_set_30min, target_names=current_target_names_30min, zero_division=0))
    else:
        model_30min = None
        print("Y_30min için tek sınıf var, model eğitilmedi.")


    # Anlık Arıza Tipi Tahmin Modeli
    if y_fault_type.nunique() > 1:
        X_train_type, X_test_type, y_train_type, y_test_type = train_test_split(X, y_fault_type, test_size=0.2, random_state=42, stratify=y_fault_type)
        model_fault_type = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
        model_fault_type.fit(X_train_type, y_train_type)
        predictions_fault_type = model_fault_type.predict(X_test_type)
        print("\n--- Anlık Arıza Tipi Tahmin Modeli Performansı ---")
        # Test setindeki benzersiz etiketleri alın ve FAULT_TYPES'dan karşılıklarını bulun
        labels_in_test_set_type = np.unique(y_test_type).tolist()
        # FAULT_TYPES'ın sayısal indeksleri ile string karşılıklarını eşleştirin
        current_target_names_type = [FAULT_TYPES[int(label)] for label in labels_in_test_set_type]
        print(classification_report(y_test_type, predictions_fault_type, labels=labels_in_test_set_type, target_names=current_target_names_type, zero_division=0))
    else:
        model_fault_type = None
        print("Y_fault_type için tek sınıf var, model eğitilmedi.")


    # Modelleri Kaydetme (tek bir dosya olarak birden fazla modeli ve özellikleri kaydediyoruz)
    joblib.dump({
        'model_5min': model_5min,
        'model_30min': model_30min,
        'model_fault_type': model_fault_type,
        'features_cols': features_cols, # Bu liste tahmin yaparken kullanılacak
        'fault_type_map_text': FAULT_TYPES # Tahminlerde metin karşılıklarını bulmak için
    }, MODEL_SAVE_PATH)
    print(f"\nModeller '{MODEL_SAVE_PATH}' adresine kaydedildi.")

if __name__ == "__main__":
    train_model()