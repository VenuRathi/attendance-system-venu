import sqlite3
import os

# Project root directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Database folder and file
DB_DIR = os.path.join(BASE_DIR, "database")
DB_PATH = os.path.join(DB_DIR, "attendance.db")


def get_connection():
    """Create and return a database connection"""
    os.makedirs(DB_DIR, exist_ok=True)
    return sqlite3.connect(DB_PATH)


def init_db():
    """Initialize database and create tables"""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT,
    name TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT
    );
    """)

    conn.commit()
    conn.close()


def insert_attendance(uid, name, status):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO attendance (uid, name, status) VALUES (?, ?, ?)",
        (uid, name, status)
    )

    conn.commit()
    conn.close()



def get_all_attendance():
    """Fetch all attendance records"""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM attendance ORDER BY timestamp DESC")
    rows = cursor.fetchall()

    conn.close()
    return rows

