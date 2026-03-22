import os
import mysql.connector
from mysql.connector import pooling

_pool = None


def _get_pool():
    global _pool
    if _pool is None:
        _pool = pooling.MySQLConnectionPool(
            pool_name="sentiment_pool",
            pool_size=5,
            host=os.environ.get("DB_HOST", "localhost"),
            port=int(os.environ.get("DB_PORT", 3306)),
            user=os.environ.get("DB_USER", "root"),
            password=os.environ.get("DB_PASSWORD", ""),
            database=os.environ.get("DB_NAME", "sentiment_db"),
        )
    return _pool


def get_conn():
    return _get_pool().get_connection()


def init_db():
    conn = get_conn()
    cur  = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            text        TEXT NOT NULL,
            label       VARCHAR(20) NOT NULL,
            score       FLOAT NOT NULL,
            latency_ms  FLOAT NOT NULL,
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    cur.close()
    conn.close()


def insert_analysis(text: str, label: str, score: float, latency_ms: float) -> int:
    conn = get_conn()
    cur  = conn.cursor()
    cur.execute(
        "INSERT INTO analyses (text, label, score, latency_ms) VALUES (%s, %s, %s, %s)",
        (text, label, score, latency_ms),
    )
    conn.commit()
    row_id = cur.lastrowid
    cur.close()
    conn.close()
    return row_id


def get_history(limit: int = 100) -> list[dict]:
    conn = get_conn()
    cur  = conn.cursor(dictionary=True)
    cur.execute(
        "SELECT id, text, label, score, latency_ms, created_at "
        "FROM analyses ORDER BY created_at DESC LIMIT %s",
        (limit,),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    for r in rows:
        if r.get("created_at"):
            r["created_at"] = r["created_at"].strftime("%Y-%m-%d %H:%M:%S")
    return rows


def get_stats() -> dict:
    conn = get_conn()
    cur  = conn.cursor(dictionary=True)

    cur.execute("SELECT COUNT(*) AS total FROM analyses")
    total = cur.fetchone()["total"]

    cur.execute("""
        SELECT label, COUNT(*) AS count
        FROM analyses GROUP BY label
    """)
    dist = {r["label"]: r["count"] for r in cur.fetchall()}

    cur.execute("SELECT AVG(latency_ms) AS avg_ms FROM analyses")
    avg_ms = round(cur.fetchone()["avg_ms"] or 0, 1)

    cur.execute("""
        SELECT DATE(created_at) AS day, label, COUNT(*) AS count
        FROM analyses
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY day, label
        ORDER BY day
    """)
    trend_raw = cur.fetchall()

    cur.close()
    conn.close()

    trend = {}
    for r in trend_raw:
        day = str(r["day"])
        if day not in trend:
            trend[day] = {"day": day, "Positive": 0, "Negative": 0, "Neutral": 0}
        trend[day][r["label"]] = r["count"]

    return {
        "total":        total,
        "distribution": dist,
        "avg_latency_ms": avg_ms,
        "trend":        list(trend.values()),
    }
