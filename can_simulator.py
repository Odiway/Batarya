# can_simulator.py
import time
import random
import requests
from datetime import datetime, timedelta
import json # Json importunu ekledik

NEXTJS_API_URL = "http://localhost:3000/api/can-data"

# --- Yeni Sabitler ve Modeller ---
DRIVING_MODES = ['idle', 'accelerating', 'cruising', 'braking', 'uphill', 'downhill']
FAULT_TYPES = ["voltage_drop_fault", "overheat_fault", "efficiency_loss_fault", "cell_imbalance_fault", "capacity_loss_fault"]

# Her mod için base değer ve varyasyon tanımları
MODE_PROFILES = {
    'idle': {'voltage': (3.75, 0.05), 'temp': (28.0, 2.0), 'efficiency': (90.0, 1.0)},
    'accelerating': {'voltage': (3.50, 0.15), 'temp': (35.0, 3.0), 'efficiency': (85.0, 2.0)},
    'cruising': {'voltage': (3.70, 0.08), 'temp': (32.0, 2.5), 'efficiency': (92.0, 1.5)},
    'braking': {'voltage': (4.00, 0.10), 'temp': (30.0, 2.0), 'efficiency': (95.0, 1.0)}, # Rejeneratif şarj
    'uphill': {'voltage': (3.40, 0.20), 'temp': (40.0, 4.0), 'efficiency': (80.0, 3.0)},
    'downhill': {'voltage': (3.90, 0.12), 'temp': (30.0, 2.5), 'efficiency': (93.0, 1.5)},
}

# --- generate_realistic_data fonksiyonu ---
def generate_realistic_data(bus_id, current_time, current_mode, battery_soh, current_fault_type="normal"):
    # Mod profiline göre baz değerleri al
    mode_profile = MODE_PROFILES.get(current_mode, MODE_PROFILES['idle'])
    
    base_voltage_mean, base_voltage_std = mode_profile['voltage']
    base_temp_mean, base_temp_std = mode_profile['temp']
    base_efficiency_mean, base_efficiency_std = mode_profile['efficiency']

    # SOH'un değerler üzerindeki etkisi
    # SOH düştükçe voltaj daha düşük, sıcaklık daha yüksek, verimlilik daha düşük olsun
    # Bu faktörler rastgelelik ve SOH'un gerçekçi etkisini artırmak için ayarlandı.
    soh_effect_voltage = (100.0 - battery_soh) / 100.0 * 0.3 # SOH azaldıkça voltajı daha da düşür
    soh_effect_temp = (100.0 - battery_soh) / 100.0 * 10.0 # SOH azaldıkça sıcaklığı daha da artır
    soh_effect_efficiency = (100.0 - battery_soh) / 100.0 * 15.0 # SOH azaldıkça verimliliği daha da düşür

    cell_voltage = round(random.gauss(base_voltage_mean - soh_effect_voltage, base_voltage_std * (1 + soh_effect_voltage)), 2)
    
    # Sıcaklık farkını SOH'a göre artır
    temp_diff_base = random.uniform(1.0, 3.0) * (1 + (100 - battery_soh) / 100.0 * 0.5)
    
    cell_min_temp = round(random.gauss(base_temp_mean + soh_effect_temp - temp_diff_base / 2, base_temp_std * (1 + soh_effect_temp / 5)), 1)
    cell_max_temp = round(random.gauss(base_temp_mean + soh_effect_temp + temp_diff_base / 2, base_temp_std * (1 + soh_effect_temp / 5)), 1)
    
    energy_efficiency = round(random.gauss(base_efficiency_mean - soh_effect_efficiency, base_efficiency_std * (1 + soh_effect_efficiency / 10)), 1)

    # Arıza enjeksiyonları
    if current_fault_type == "voltage_drop_fault":
        cell_voltage = round(random.uniform(3.0, 3.3), 2) # Kritik düşük voltaj
        energy_efficiency = round(random.uniform(70.0, 78.0), 1)
    elif current_fault_type == "overheat_fault":
        cell_min_temp = round(random.uniform(45.0, 55.0), 1)
        cell_max_temp = round(random.uniform(50.0, 65.0), 1)
    elif current_fault_type == "efficiency_loss_fault":
        energy_efficiency = round(random.uniform(60.0, 75.0), 1)
        cell_voltage = round(random.uniform(cell_voltage - 0.2, cell_voltage - 0.1), 2)
    elif current_fault_type == "cell_imbalance_fault":
        # Hücreler arası farkı artır
        cell_voltage = round(random.uniform(cell_voltage - 0.1, cell_voltage + 0.1), 2)
        cell_min_temp = round(random.uniform(20.0, 30.0), 1) # Normal aralıkta kalsın ama fark oluşsun
        cell_max_temp = round(random.uniform(35.0, 45.0), 1) # Max temp daha yüksek olsun
        if abs(cell_max_temp - cell_min_temp) < 10: # Farkı garanti et
            cell_max_temp = cell_min_temp + random.uniform(10, 15)
    elif current_fault_type == "capacity_loss_fault":
        energy_efficiency = round(random.uniform(55.0, 65.0), 1)
        cell_voltage = round(random.uniform(3.2, 3.5), 2) # Orta düzeyde düşüş
        battery_soh = round(battery_soh - random.uniform(1.0, 2.0), 2) # SOH daha hızlı düşsün


    # Voltaj ve sıcaklık için gerçekçi sınırlar (aşırıya kaçmasın)
    cell_voltage = max(2.8, min(4.3, cell_voltage))
    cell_min_temp = max(-15.0, min(65.0, cell_min_temp))
    cell_max_temp = max(-10.0, min(75.0, cell_max_temp)) 
    if cell_min_temp > cell_max_temp: # Min temp, Max temp'ten büyük olmamalı
        cell_min_temp, cell_max_temp = cell_max_temp, cell_min_temp
    energy_efficiency = max(40.0, min(99.0, energy_efficiency))

    return {
        "timestamp": current_time.isoformat(),
        "bus_id": bus_id,
        "cell_voltage": cell_voltage,
        "cell_min_temp": cell_min_temp,
        "cell_max_temp": cell_max_temp,
        "energy_efficiency": energy_efficiency,
        "current_driving_mode": current_mode,
        "battery_soh": round(battery_soh, 2),
        "current_fault_type": current_fault_type # Eğitim için bu bilgiyi kaydediyoruz
    }

# --- send_data fonksiyonu ---
def send_data(data):
    try:
        # requests.post'a doğrudan Python dictionary'si verince otomatik json'a çevirir.
        # json=data kullanımı doğrudur. Gözden geçirme sonrası herhangi bir hata bulunamadı.
        response = requests.post(NEXTJS_API_URL, json=data)
        response.raise_for_status() # HTTP hataları için
        # print(f"Data sent for {data['bus_id']} at {data['timestamp']}: {response.status_code}") # Gürültüyü azaltmak için yorum satırı yaptık
    except requests.exceptions.RequestException as e:
        print(f"Error sending data to Next.js: {e}")

# --- Ana Simülasyon Döngüsü ---
if __name__ == "__main__":
    bus_ids = ["BUS001", "BUS002"]
    
    # Her otobüs için durum değişkenleri
    bus_states = {}
    for bus_id in bus_ids:
        bus_states[bus_id] = {
            "battery_soh": 100.0, # Başlangıç SOH
            "current_driving_mode": random.choice(DRIVING_MODES),
            "fault_scenario_active": False,
            "fault_start_time": None,
            "current_fault_type": "normal",
            "fault_duration": timedelta(minutes=random.randint(10, 30)),
            "mode_change_timer": datetime.now() # Mod değişimi için zamanlayıcı
        }

    simulation_time_step = timedelta(seconds=5) # Her 5 saniyede bir veri gönder

    print("Gelişmiş Sanal otobüs veri simülasyonu başlatılıyor...")
    while True:
        for bus_id in bus_ids:
            current_sim_time = datetime.now()
            state = bus_states[bus_id]

            # --- Sürüş Modu Değişimi ---
            if current_sim_time - state["mode_change_timer"] > timedelta(minutes=random.randint(2, 10)):
                state["current_driving_mode"] = random.choice(DRIVING_MODES)
                state["mode_change_timer"] = current_sim_time
                # print(f"[{bus_id}] Yeni Sürüş Modu: {state['current_driving_mode']}") # Gürültüyü azaltmak için yorum satırı

            # --- SOH Azalması (Gerçek zamanı simüle etmek için daha yavaş bir düşüş) ---
            # Örneğin, her 10 dakikada bir %0.01 düşüş
            if (current_sim_time - state["mode_change_timer"]).total_seconds() % (10 * 60) < simulation_time_step.total_seconds():
                state["battery_soh"] -= 0.005 # Her 10 dakikada yaklaşık %0.01 düşüş (10dk/5sn = 120 adımda, 120*0.00005 = 0.006)
            
            # SOH minimum sınırı
            if state["battery_soh"] < 50.0:
                state["battery_soh"] = 50.0

            # --- Arıza Senaryosu Tetikleme ---
            # Belirli bir SOH altındaysa veya belirli bir moddaysa arıza olasılığını artırabiliriz.
            fault_chance = 0.003 # Temel şans
            if state["battery_soh"] < 70.0: # SOH düştükçe arıza şansı artsın
                fault_chance += 0.002
            if state["current_driving_mode"] == 'uphill': # Yokuş yukarı modunda arıza şansı artsın
                fault_chance += 0.001

            if not state["fault_scenario_active"] and random.random() < fault_chance:
                state["fault_scenario_active"] = True
                state["fault_start_time"] = current_sim_time
                state["current_fault_type"] = random.choice(FAULT_TYPES)
                state["fault_duration"] = timedelta(minutes=random.randint(10, 30))
                print(f"\n--- [{bus_id}] için {state['current_fault_type']} arızası başladı! ---")

            # Arıza devam ediyorsa
            if state["fault_scenario_active"]:
                if current_sim_time - state["fault_start_time"] > state["fault_duration"]:
                    state["fault_scenario_active"] = False
                    state["current_fault_type"] = "normal"
                    print(f"\n--- [{bus_id}] için arıza senaryosu sona erdi, normale dönülüyor. ---")
            
            # Veri üret ve gönder
            data = generate_realistic_data(
                bus_id, 
                current_sim_time, 
                state["current_driving_mode"], 
                state["battery_soh"], 
                state["current_fault_type"]
            )
            send_data(data)

        time.sleep(simulation_time_step.total_seconds())