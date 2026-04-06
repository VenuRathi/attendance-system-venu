import os
import sys
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from backend.auth import require_api_key
from backend.database import init_db, insert_attendance, get_all_attendance, get_connection


app = Flask(__name__, template_folder="../frontend/templates")
CORS(app)

# 🔥 DASHBOARD ROUTE (NOW CORRECT POSITION)
@app.route("/")
def home():
    return "Backend is running 🚀"


# 🔥 UID → Name mapping
student_db = {
    "5D229659": "Aditya",
    "D12F46": "Sameera",
    "4BFC8A4": "Venu",
    "62DC7C5": "Prachiti",
    "3DC1CB59": "Shravasti"
}


# 🔥 Duplicate check
def is_duplicate(uid):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM attendance
            WHERE uid = ? AND DATE(timestamp) = DATE('now')
        """, (uid,))

        result = cursor.fetchone()
        conn.close()

        return result is not None

    except:
        return False


# 🔥 POST attendance
@app.route("/attendance", methods=["POST"])
@require_api_key
def add_attendance():
    data = request.get_json()
    uid = data.get("uid")

    if not uid:
        return jsonify({"status": "error", "message": "UID missing"}), 400

    # INVALID
    if uid not in student_db:
        insert_attendance(uid, "Unknown", "invalid")
        return jsonify({"status": "invalid"}), 200

    name = student_db[uid]

    # DUPLICATE
    if is_duplicate(uid):
        insert_attendance(uid, name, "duplicate")
        return jsonify({"status": "duplicate", "name": name}), 200

    # SUCCESS
    insert_attendance(uid, name, "present")
    return jsonify({"status": "success", "name": name}), 200

# 🔥 GET attendance (for UI)
@app.route("/attendance", methods=["GET"])
def fetch_attendance():
    records = get_all_attendance()

    result = []
    for row in records:
        result.append({
            "id": row[0],
            "uid": row[1],
            "name": row[2],
            "timestamp": row[3],
            "status":row[4]
        })

    return jsonify(result)

@app.route("/reset", methods=["POST"])
def reset_attendance():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM attendance")
        conn.commit()
        conn.close()

        return jsonify({"status": "reset_success"}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ❌ analytics disabled for now (good decision)

if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)