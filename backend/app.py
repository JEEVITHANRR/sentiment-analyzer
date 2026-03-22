from flask import Flask
from flask_cors import CORS
from routes.sentiment import sentiment_bp
from models.db import init_db
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["*"])

app.register_blueprint(sentiment_bp, url_prefix="/api")

with app.app_context():
    init_db()

@app.route("/health")
def health():
    return {"status": "ok", "service": "sentiment-analyzer-api"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
