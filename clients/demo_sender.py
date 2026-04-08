import requests
import json

# Test the ESP32 functionality with Python (simulating HTTPS request to deployed server)
server_url = "https://attendance-system-ul60.onrender.com/attendance"
api_key = "ESP32_SECRET_KEY_123"

# Test with a valid UID from the database
test_uid = "5D229659"  # Aditya

headers = {
    "Content-Type": "application/json",
    "X-API-KEY": api_key
}

data = {"uid": test_uid}

print(f"Testing POST to {server_url}")
print(f"Sending data: {data}")
print(f"Headers: X-API-KEY={api_key}")

try:
    response = requests.post(server_url, json=data, headers=headers, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

    # Test GET to see if data was stored
    print("\nTesting GET request...")
    get_response = requests.get(server_url, timeout=10)
    print(f"GET Status: {get_response.status_code}")
    attendance_data = get_response.json()
    print(f"Attendance records: {len(attendance_data)} found")

    # Show the latest record
    if attendance_data:
        latest = attendance_data[0]
        print(f"Latest record: {latest}")

except requests.exceptions.RequestException as e:
    print(f"Request Error: {e}")
except Exception as e:
    print(f"Error: {e}")
