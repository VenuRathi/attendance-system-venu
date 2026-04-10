import os
import sys
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from backend.auth import require_api_key
from backend.database import (
    init_db,
    insert_attendance,
    get_all_attendance,
    get_attendance_summary,
    get_lecture_stats,
    get_or_init_lecture_state,
    update_lecture_state,
    reset_attendance,
    get_connection,
)

app = Flask(__name__)
CORS(app)

# 🔥 HOME
@app.route("/")
def home():
    return "Backend is running 🚀"


# 🔥 UID → Name mapping
student_db = {
    "5D229659": "Pallavi",
    "D12F46": "Devika",
    "4BFC8A4": "Venu",
    "62DC7C5": "Alfiya",
    "3DC1CB59": "Shravasti"
}


def serialize_record(row):
    return {
        "id": row["id"],
        "uid": row["uid"],
        "name": row["name"],
        "lectureNumber": row["lecture_number"],
        "timestamp": row["timestamp"],
        "status": row["status"],
    }


def get_active_lecture():
    state = get_or_init_lecture_state()
    return {
        "lectureNumber": state["lecture_number"],
        "isActive": state["is_active"] == "true",
        "startedAt": state["started_at"],
    }


def parse_int(value, default=None):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def is_duplicate(uid, lecture_number):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT 1 FROM attendance WHERE uid = ? AND lecture_number = ? AND status = 'present' LIMIT 1",
            (uid, lecture_number),
        )

        result = cursor.fetchone()
        conn.close()

        return result is not None

    except Exception as e:
        print("Duplicate check error:", e)
        return False


@app.route("/attendance", methods=["GET"])
def fetch_attendance():
    lecture_number = parse_int(request.args.get("lectureNumber"))
    records = get_all_attendance(lecture_number)
    return jsonify([serialize_record(row) for row in records])


@app.route("/attendance", methods=["POST"])
@require_api_key
def add_attendance():
    data = request.get_json()

    if not data or "uid" not in data:
        return jsonify({"status": "error", "message": "UID missing"}), 400

    # 🔥 CHECK IF LECTURE IS ACTIVE
    active_lecture = get_active_lecture()
    if not active_lecture["isActive"]:
        return jsonify({"status": "error", "message": "No active lecture. Scanning is disabled."}), 403

    uid = data.get("uid")
    lecture_number = active_lecture["lectureNumber"] or 1

    if uid not in student_db:
        insert_attendance(uid, "Unknown", "invalid", lecture_number)
        return jsonify({"status": "invalid"}), 200

    name = student_db[uid]
    if is_duplicate(uid, lecture_number):
        insert_attendance(uid, name, "duplicate", lecture_number)
        return jsonify({"status": "duplicate", "name": name}), 200

    insert_attendance(uid, name, "present", lecture_number)
    return jsonify({"status": "success", "name": name}), 200


@app.route("/api/healthz", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"})


@app.route("/api/attendance", methods=["GET"])
def api_get_attendance():
    lecture_number = parse_int(request.args.get("lectureNumber"))
    records = get_all_attendance(lecture_number)
    return jsonify([serialize_record(row) for row in records])


@app.route("/api/attendance", methods=["POST"])
def api_create_attendance():
    data = request.get_json()

    if not data or "uid" not in data or "name" not in data:
        return jsonify({"error": "uid and name are required"}), 400

    # 🔥 CHECK IF LECTURE IS ACTIVE
    active_lecture = get_active_lecture()
    if not active_lecture["isActive"]:
        return jsonify({"error": "No active lecture. Scanning is disabled."}), 403

    uid = data.get("uid")
    name = data.get("name")
    lecture_number = active_lecture["lectureNumber"] or 1

    if uid not in student_db:
        insert_attendance(uid, "Unknown", "invalid", lecture_number)
        return jsonify({"status": "invalid"}), 200

    if is_duplicate(uid, lecture_number):
        insert_attendance(uid, name, "duplicate", lecture_number)
        return jsonify({"status": "duplicate", "name": name}), 200

    insert_attendance(uid, name, "present", lecture_number)
    return jsonify({"status": "success", "name": name}), 200


@app.route("/api/attendance/summary", methods=["GET"])
def api_attendance_summary():
    return jsonify(get_attendance_summary())


@app.route("/api/attendance/lecture-stats", methods=["GET"])
def api_lecture_stats():
    return jsonify(get_lecture_stats())


@app.route("/api/lectures/active", methods=["GET"])
def api_active_lecture():
    return jsonify(get_active_lecture())


@app.route("/api/lectures/start", methods=["POST"])
def api_start_lecture():
    data = request.get_json()
    lecture_number = parse_int(data.get("lectureNumber")) if data else None

    if lecture_number is None or lecture_number < 1 or lecture_number > 8:
        return jsonify({"error": "lectureNumber must be between 1 and 8"}), 400

    started_at = datetime.utcnow().isoformat()
    update_lecture_state(lecture_number, "true", started_at)
    return jsonify({"lectureNumber": lecture_number, "isActive": True, "startedAt": started_at})


@app.route("/api/lectures/end", methods=["POST"])
def api_end_lecture():
    state = get_or_init_lecture_state()
    if state["is_active"] != "true":
        return jsonify({"error": "No active lecture"}), 400

    update_lecture_state(state["lecture_number"], "false", state["started_at"])
    return jsonify({
        "lectureNumber": state["lecture_number"],
        "isActive": False,
        "startedAt": state["started_at"],
    })


@app.route("/api/reset", methods=["POST"])
def api_reset():
    reset_attendance()
    update_lecture_state(None, "false", None)
    return jsonify({"success": True, "message": "System reset successfully"})


# 🔥 RESET (FIXED + SAFE)
@app.route("/reset", methods=["POST"])
def reset_attendance_route():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM attendance")
        conn.commit()

        # 🔥 FORCE CLOSE & REOPEN (important for Render)
        conn.close()

        print("🔥 DATABASE RESET SUCCESS")

        return jsonify({"status": "reset_success"}), 200

    except Exception as e:
        print("❌ RESET ERROR:", e)
        return jsonify({"status": "error", "message": str(e)}), 500


# 🔥 START
if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)