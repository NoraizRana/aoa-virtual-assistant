import json
import pickle
import sys
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

MODEL_PATH = "../model/tfidf_model.pkl"
DATA_PATH  = "../model/qa_data.pkl"

# ── Load model (once, cached) ─────────────────────────
_model   = None
_qa_data = None

def load():
    global _model, _qa_data
    if _model is None:
        with open(MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
        with open(DATA_PATH, "rb") as f:
            _qa_data = pickle.load(f)
    return _model, _qa_data

def find_best_answer(query, top_k=3):
    model, qa_data = load()

    vectorizer   = model["vectorizer"]
    tfidf_matrix = model["tfidf_matrix"]

    # Transform user query
    query_vec = vectorizer.transform([query])

    # Calculate cosine similarity with all Q&A
    similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()

    # Get top-k matches
    top_indices = np.argsort(similarities)[::-1][:top_k]

    results = []
    for idx in top_indices:
        score = float(similarities[idx])
        if score > 0.1:   # minimum threshold
            item = qa_data[idx]
            results.append({
                "topic":    item["topic"],
                "question": item["question"],
                "answer":   item["answer"],
                "type":     item.get("type", "conceptual"),
                "score":    round(score, 4),
            })

    return results

if __name__ == "__main__":
    query   = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "merge sort"
    results = find_best_answer(query)

    import json
    print(json.dumps(results, indent=2))