import csv
import io
from flask import Blueprint, request, jsonify
from services.bert_service import analyze_text, analyze_batch
from models.db import insert_analysis, get_history, get_stats

sentiment_bp = Blueprint("sentiment", __name__)


@sentiment_bp.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "").strip()
    if not text:
        return jsonify({"error": "text is required"}), 400
    try:
        result = analyze_text(text)
        insert_analysis(result["text"], result["label"],
                        result["score"], result["latency_ms"])
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@sentiment_bp.route("/batch", methods=["POST"])
def batch():
    if "file" in request.files:
        f    = request.files["file"]
        raw  = f.read().decode("utf-8", errors="ignore")
        reader = csv.reader(io.StringIO(raw))
        texts  = [row[0].strip() for row in reader if row and row[0].strip()]
    else:
        data  = request.get_json(silent=True) or {}
        texts = data.get("texts", [])

    if not texts:
        return jsonify({"error": "No texts provided"}), 400
    if len(texts) > 500:
        return jsonify({"error": "Max 500 texts per batch"}), 400

    try:
        results = analyze_batch(texts)
        for r in results:
            insert_analysis(r["text"], r["label"], r["score"], r["latency_ms"])
        return jsonify({"results": results, "count": len(results)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@sentiment_bp.route("/history", methods=["GET"])
def history():
    limit = min(int(request.args.get("limit", 100)), 500)
    return jsonify({"history": get_history(limit)})


@sentiment_bp.route("/stats", methods=["GET"])
def stats():
    return jsonify(get_stats())
