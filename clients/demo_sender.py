import requests
import random
import time

API_URL = "http://127.0.0.1:5000/attendance"

names = [
    "Rahul", "Ayesha", "Vikram", "Sneha", "Arjun",
    "Neha", "Karan", "Pooja", "Aman", "Ishita"
]

print("📡 Demo sender started (simulating ESP32)...")

for _ in range(15):
    uid = hex(random.randint(100000, 999999))
    name = random.choice(names)

    payload = {
        "uid": uid,
        "name": name
    }

    try:
        headers = {
            "X-API-KEY": "ESP32_SECRET_KEY_123"
        }

        response = requests.post(API_URL, json=payload, headers=headers)

        if response.status_code in (200, 201):
            print(f"✅ Sent: UID={uid} Name={name}")
        else:
            print(f"❌ Failed [{response.status_code}]: {response.text}")

    except Exception as e:
        print("❌ Error:", e)

    time.sleep(0.5)

print("✅ Demo sender finished")
