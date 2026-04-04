import pandas as pd
import sqlite3
import os
import matplotlib.pyplot as plt

# Project root directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Database path
DB_PATH = os.path.join(BASE_DIR, "database", "attendance.db")

# Folder to store graphs
GRAPH_DIR = os.path.join(BASE_DIR, "analytics", "graphs")
os.makedirs(GRAPH_DIR, exist_ok=True)


def load_attendance_data():
    """Load attendance data into pandas DataFrame"""
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query("SELECT * FROM attendance", conn)
    conn.close()
    return df


def generate_attendance_per_student():
    """Bar chart: total attendance per student"""
    df = load_attendance_data()

    if df.empty:
        return None

    counts = df["name"].value_counts()

    plt.figure(figsize=(8, 5))
    counts.plot(kind="bar")
    plt.title("Attendance per Student")
    plt.xlabel("Student Name")
    plt.ylabel("Total Entries")
    plt.tight_layout()

    output = os.path.join(GRAPH_DIR, "attendance_per_student.png")
    plt.savefig(output)
    plt.close()

    return output


def generate_daily_attendance():
    """Line chart: attendance trend per day"""
    df = load_attendance_data()

    if df.empty:
        return None

    df["date"] = pd.to_datetime(df["timestamp"]).dt.date
    daily = df.groupby("date").size()

    plt.figure(figsize=(8, 5))
    daily.plot(kind="line", marker="o")
    plt.title("Daily Attendance Trend")
    plt.xlabel("Date")
    plt.ylabel("Entries")
    plt.tight_layout()

    output = os.path.join(GRAPH_DIR, "attendance_daily.png")
    plt.savefig(output)
    plt.close()

    return output
