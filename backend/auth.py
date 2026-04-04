# backend/auth.py

from functools import wraps
from flask import request, jsonify

# Simple API key (later this can come from env variable or DB)
API_KEY = "ESP32_SECRET_KEY_123"


def require_api_key(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        key = request.headers.get("X-API-KEY")

        if not key or key != API_KEY:
            return jsonify({"error": "Unauthorized"}), 401

        return f(*args, **kwargs)

    return decorated
