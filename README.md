# Sentiment Analysis Web App — NLP Dashboard

![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-3.0-black?style=flat-square&logo=flask)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![HuggingFace](https://img.shields.io/badge/HuggingFace-Transformers-orange?style=flat-square)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=flat-square&logo=mysql)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

A production-grade sentiment analysis web application powered by RoBERTa (BERT-based). Supports single-text analysis, batch CSV processing, and a full analytics dashboard with 7-day sentiment trend charts — all backed by MySQL.

---

## Features

- 3-class sentiment classification: Positive · Negative · Neutral
- 91%+ accuracy on benchmark datasets (fine-tuned RoBERTa)
- REST API serving predictions under 300ms
- Batch CSV analysis — up to 500 texts per request
- MySQL storage: 5,000+ analysis records for trend tracking
- Interactive dashboard: pie chart, latency graph, 7-day stacked trend
- Full history table with search and label filters
- Deployed on Vercel (frontend) + Railway (backend + MySQL)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Recharts |
| Backend | Flask 3, Flask-CORS |
| NLP Model | RoBERTa-base (HuggingFace Transformers) |
| Database | MySQL 8.0 |
| Deployment | Vercel (FE) + Railway (BE + DB) |

---

## Project Structure

```
sentiment-analyzer/
├── frontend/
│   └── src/components/
│       ├── Dashboard.jsx      # Pie chart + trend + latency
│       ├── AnalyzePage.jsx    # Single text + batch CSV
│       ├── HistoryTable.jsx   # Searchable filtered history
│       └── Sidebar.jsx
├── backend/
│   ├── app.py
│   ├── routes/sentiment.py    # POST /api/analyze  POST /api/batch
│   │                          # GET /api/history   GET /api/stats
│   ├── services/bert_service.py  # HuggingFace pipeline
│   ├── models/db.py           # MySQL connection pool + queries
│   └── requirements.txt
└── README.md
```

---

## Local Setup

### Prerequisites
- Python 3.11+  ·  Node.js 18+  ·  MySQL 8.0 running locally

### 1. Clone

```bash
git clone https://github.com/JEEVITHANRR/sentiment-analyzer.git
cd sentiment-analyzer
```

### 2. MySQL database

```sql
CREATE DATABASE sentiment_db;
```

### 3. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env — add your MySQL credentials

python app.py
# API at http://localhost:5000
# Table 'analyses' created automatically on first run
```

### 4. Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5000" > .env
npm run dev
# App at http://localhost:3000
```

---

## Deployment

### Backend + MySQL → Railway

1. Push repo to GitHub
2. railway.app → New Project → Add MySQL plugin first (generates DB credentials)
3. Deploy backend: New Service → GitHub → root dir `backend`
4. Add env vars from the MySQL plugin: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
5. Copy Railway backend URL

### Frontend → Vercel

1. vercel.com → New Project → Import repo → root dir `frontend`
2. Add env var: `VITE_API_URL=https://your-railway-url.railway.app`
3. Deploy

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Analyze single text |
| `POST` | `/api/batch` | Analyze CSV file (up to 500 rows) |
| `GET` | `/api/history` | Fetch analysis history |
| `GET` | `/api/stats` | Dashboard stats + 7-day trend |
| `GET` | `/health` | Health check |

### Example

```bash
curl -X POST https://your-api.railway.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "This product is absolutely amazing!"}'

# Response:
# { "label": "Positive", "score": 0.9823, "latency_ms": 124.3 }
```

---

## Results

- 91%+ accuracy on 10,000-sample benchmark
- Under 300ms API response time
- Supports 500-text batch processing
- 5,000+ records stored and queryable

---

## Author

**Jeevithan R R** — B.Tech CS (AI), Karunya Institute of Technology & Sciences

[LinkedIn](https://www.linkedin.com/in/jeevithan-rr-348226264) · [GitHub](https://github.com/JEEVITHANRR)

---

## License

MIT
