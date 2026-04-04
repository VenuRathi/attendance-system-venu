import os
import sys
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

# Fix import paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from backend.auth import require_api_key
from backend.database import init_db, insert_attendance, get_all_attendance, get_connection

#from analytics.analytics import (
 #   generate_attendance_per_student,
  #  generate_daily_attendance
#)


app = Flask(__name__)
CORS(app)   # 🔥 ADD THIS

# 🔥 UID → Name mapping (backend controlled now)
student_db = {
    "5D229659": "Aditya",
    "D12F46": "Sameera",
    "4BFC8A4": "Venu",
    "62DC7C5": "Prachiti",
    "3DC1CB59": "Shravasti"
}

# 🔥 Helper: check if already marked today
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


@app.route("/attendance", methods=["POST"])
@require_api_key
def add_attendance():
    data = request.get_json()

    uid = data.get("uid")

    if not uid:
        return jsonify({"status": "error"}), 400

    # 🔥 Check if card is registered
    if uid not in student_db:
        return jsonify({
            "status": "invalid",
            "message": "Card not registered"
        }), 200

    name = student_db[uid]

    # 🔁 Check duplicate
    if is_duplicate(uid):
        return jsonify({
            "status": "duplicate",
            "name": name
        }), 200

    # ✅ Insert attendance
    insert_attendance(uid, name)

    return jsonify({
        "status": "success",
        "name": name
    }), 200

@app.route("/attendance", methods=["GET"])
def fetch_attendance():
    records = get_all_attendance()

    result = []
    for row in records:
        result.append({
            "id": row[0],
            "uid": row[1],
            "name": row[2],
            "timestamp": row[3]
        })

    return jsonify(result)


#@app.route("/analytics/generate", methods=["GET"])
#def generate_analytics():
  #  chart1 = generate_attendance_per_student()
 #   chart2 = generate_daily_attendance()
#
 #   return jsonify({
  #      "status": "generated",
   #     "attendance_per_student": bool(chart1),
    #    "daily_attendance": bool(chart2)
    #})

if __name__ == "__main__":
    init_db()  # 🔥 MOVE HERE
    app.run(host="0.0.0.0", port=5000, debug=True)