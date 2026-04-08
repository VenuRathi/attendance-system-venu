import sqlite3
import os
from datetime import datetime

# Project root directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Database folder and file
DB_DIR = os.path.join(BASE_DIR, "database")
DB_PATH = os.path.join(DB_DIR, "attendance.db")


def get_connection():
    """Create and return a database connection"""
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, detect_types=sqlite3.PARSE_DECLTYPES)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize database and create tables"""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT,
    name TEXT,
    lecture_number INTEGER DEFAULT 1,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS lecture_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lecture_number INTEGER,
    is_active TEXT CHECK(is_active IN ('true','false')) DEFAULT 'false',
    started_at DATETIME
    );
    """)

    cursor.execute("PRAGMA table_info(attendance)")
    columns = [row["name"] for row in cursor.fetchall()]
    if "lecture_number" not in columns:
        cursor.execute("ALTER TABLE attendance ADD COLUMN lecture_number INTEGER DEFAULT 1")
    if "status" not in columns:
        cursor.execute("ALTER TABLE attendance ADD COLUMN status TEXT")

    conn.commit()
    conn.close()


def insert_attendance(uid, name, status, lecture_number=1):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO attendance (uid, name, status, lecture_number) VALUES (?, ?, ?, ?)",
        (uid, name, status, lecture_number)
    )

    conn.commit()
    conn.close()


def get_all_attendance(lecture_number=None):
    """Fetch all attendance records"""
    conn = get_connection()
    cursor = conn.cursor()

    if lecture_number is not None:
        cursor.execute(
            "SELECT * FROM attendance WHERE lecture_number = ? ORDER BY timestamp DESC",
            (lecture_number,),
        )
    else:
        cursor.execute("SELECT * FROM attendance ORDER BY timestamp DESC")

    rows = cursor.fetchall()
    conn.close()
    return rows


def get_attendance_summary():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM attendance")
    rows = cursor.fetchall()
    conn.close()

    summary = {}
    for row in rows:
        uid = row["uid"]
        if uid not in summary:
            summary[uid] = {
                "name": row["name"],
                "uid": uid,
                "totalScans": 0,
                "presentCount": 0,
                "duplicateCount": 0,
                "invalidCount": 0,
            }

        summary[uid]["totalScans"] += 1
        if row["status"] == "present":
            summary[uid]["presentCount"] += 1
        elif row["status"] == "duplicate":
            summary[uid]["duplicateCount"] += 1
        elif row["status"] == "invalid":
            summary[uid]["invalidCount"] += 1

    return list(summary.values())


def get_lecture_stats():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM attendance")
    rows = cursor.fetchall()
    conn.close()

    stats = {
        i: {
            "lectureNumber": i,
            "totalScans": 0,
            "presentCount": 0,
            "duplicateCount": 0,
            "invalidCount": 0,
        }
        for i in range(1, 9)
    }

    for row in rows:
        lecture_number = row["lecture_number"] or 1
        entry = stats.get(lecture_number)
        if not entry:
            continue

        entry["totalScans"] += 1
        if row["status"] == "present":
            entry["presentCount"] += 1
        elif row["status"] == "duplicate":
            entry["duplicateCount"] += 1
        elif row["status"] == "invalid":
            entry["invalidCount"] += 1

    return list(stats.values())


def get_or_init_lecture_state():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM lecture_state LIMIT 1")
    row = cursor.fetchone()

    if row:
        conn.close()
        return row

    cursor.execute(
        "INSERT INTO lecture_state (lecture_number, is_active, started_at) VALUES (?, ?, ?)",
        (None, "false", None),
    )
    conn.commit()

    cursor.execute("SELECT * FROM lecture_state LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    return row


def update_lecture_state(lecture_number=None, is_active="false", started_at=None):
    conn = get_connection()
    cursor = conn.cursor()
    state = get_or_init_lecture_state()
    cursor.execute(
        "UPDATE lecture_state SET lecture_number = ?, is_active = ?, started_at = ? WHERE id = ?",
        (lecture_number, is_active, started_at, state["id"]),
    )
    conn.commit()
    conn.close()


def reset_attendance():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM attendance")
    conn.commit()
    conn.close()

