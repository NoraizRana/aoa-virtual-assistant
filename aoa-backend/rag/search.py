import numpy as np
import faiss
import pickle
import sys
import json
import re
import os
from sentence_transformers import SentenceTransformer

INDEX_PATH  = "../data/faiss_index.bin"
CHUNKS_PATH = "../data/chunks.pkl"

_model  = None
_index  = None
_chunks = None

def load():
    global _model, _index, _chunks
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        _index = faiss.read_index(INDEX_PATH)
        with open(CHUNKS_PATH, "rb") as f:
            _chunks = pickle.load(f)
    return _model, _index, _chunks

def clean(text):
    text = re.sub(r'\(cid:\d+\)', '', text)
    text = re.sub(r'[^\x20-\x7E]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_sentences(text, max_count=4):
    text  = clean(text)
    sents = re.split(r'(?<=[.!?])\s+', text)
    good  = [
        s.strip() for s in sents
        if 10 < len(s.split()) < 50
        and sum(c.isalpha() for c in s) / max(len(s), 1) > 0.55
    ]
    return good[:max_count]

def search(query, top_k=5):
    model, index, chunks = load()
    vec = model.encode([query]).astype(np.float32)
    distances, indices = index.search(vec, top_k)

    results      = []
    seen_chapters = set()

    for i, idx in enumerate(indices[0]):
        if idx >= len(chunks):
            continue
        chunk   = chunks[idx]
        chapter = chunk["chapter"]
        if chapter in seen_chapters:
            continue
        seen_chapters.add(chapter)

        sentences = extract_sentences(chunk["text"])
        if not sentences:
            continue

        results.append({
            "chapter":   chapter,
            "sentences": sentences,
            "score":     float(distances[0][i]),
        })

    return results

if __name__ == "__main__":
    if not os.path.exists(INDEX_PATH):
        print(json.dumps({"error": "Run build_index.py first"}))
        sys.exit(1)
    query = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "merge sort"
    print(json.dumps(search(query), indent=2))