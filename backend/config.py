# backend/config.py

import os

# Base directory of the project
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# SQLite database path
DB_PATH = os.path.join(BASE_DIR, "database", "attendance.db")

# Flask secret key (change in production)
SECRET_KEY = "dev-secret-key-123"

# Allowed device keys (ESP32 / demo script)
ALLOWED_DEVICE_KEYS = [
    "ESP32_DEV_001",
    "DEMO_SCRIPT_001"
]
