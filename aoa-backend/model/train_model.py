import json
import pickle
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# ── Paths ─────────────────────────────────────────────
QA_PATH    = "../data/qa_dataset.json"
MODEL_PATH = "../model/tfidf_model.pkl"
DATA_PATH  = "../model/qa_data.pkl"

print("Loading Q&A dataset...")
with open(QA_PATH, "r", encoding="utf-8") as f:
    qa_data = json.load(f)

print(f"Total Q&A pairs: {len(qa_data)}")

# ── Combine question + keywords for better matching ───
documents = []
for item in qa_data:
    # Combine question + topic + keywords for richer matching
    keywords = " ".join(item.get("keywords", []))
    topic    = item.get("topic", "")
    question = item.get("question", "")
    combined = f"{question} {topic} {keywords} {topic} {topic}"
    documents.append(combined)

# ── Train TF-IDF Vectorizer ───────────────────────────
print("Training TF-IDF model...")
vectorizer = TfidfVectorizer(
    ngram_range=(1, 3),      # unigrams, bigrams, trigrams
    max_features=50000,      # top 50k features
    stop_words="english",    # remove common words
    min_df=1,                # minimum document frequency
    sublinear_tf=True,       # log normalization
)

tfidf_matrix = vectorizer.fit_transform(documents)
print(f"TF-IDF matrix shape: {tfidf_matrix.shape}")
print(f"Vocabulary size: {len(vectorizer.vocabulary_)}")

# ── Save Model ────────────────────────────────────────
os.makedirs("../model", exist_ok=True)

with open(MODEL_PATH, "wb") as f:
    pickle.dump({
        "vectorizer": vectorizer,
        "tfidf_matrix": tfidf_matrix,
    }, f)

with open(DATA_PATH, "wb") as f:
    pickle.dump(qa_data, f)

print(f"Model saved to: {MODEL_PATH}")
print(f"Data saved to:  {DATA_PATH}")
print("Training complete!")