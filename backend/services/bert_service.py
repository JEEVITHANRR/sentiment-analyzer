import time
from transformers import pipeline

_pipe = None

LABEL_MAP = {
    "POSITIVE": "Positive",
    "NEGATIVE": "Negative",
    "NEUTRAL":  "Neutral",
    "LABEL_0":  "Negative",
    "LABEL_1":  "Neutral",
    "LABEL_2":  "Positive",
}


def _get_pipeline():
    global _pipe
    if _pipe is None:
        _pipe = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment-latest",
            tokenizer="cardiffnlp/twitter-roberta-base-sentiment-latest",
            truncation=True,
            max_length=512,
        )
    return _pipe


def analyze_text(text: str) -> dict:
    pipe  = _get_pipeline()
    t0    = time.time()
    raw   = pipe(text[:512])[0]
    ms    = round((time.time() - t0) * 1000, 1)
    label = LABEL_MAP.get(raw["label"].upper(), raw["label"].capitalize())
    return {
        "text":       text,
        "label":      label,
        "score":      round(raw["score"], 4),
        "latency_ms": ms,
    }


def analyze_batch(texts: list[str]) -> list[dict]:
    pipe    = _get_pipeline()
    t0      = time.time()
    trunc   = [t[:512] for t in texts]
    results = pipe(trunc)
    ms      = round((time.time() - t0) * 1000, 1)
    out = []
    for text, raw in zip(texts, results):
        label = LABEL_MAP.get(raw["label"].upper(), raw["label"].capitalize())
        out.append({
            "text":       text,
            "label":      label,
            "score":      round(raw["score"], 4),
            "latency_ms": round(ms / len(texts), 1),
        })
    return out
