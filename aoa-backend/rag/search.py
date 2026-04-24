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

def load_resources():
    global _model, _index, _chunks
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        _index = faiss.read_index(INDEX_PATH)
        with open(CHUNKS_PATH, "rb") as f:
            _chunks = pickle.load(f)
    return _model, _index, _chunks

def trim_to_sentences(text, max_words=80):
    """Return only the most relevant sentences"""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    result    = []
    count     = 0
    for s in sentences:
        words = s.split()
        if count + len(words) > max_words:
            break
        result.append(s)
        count += len(words)
    return ' '.join(result) if result else text[:400]

def search(query, top_k=3):
    model, index, chunks = load_resources()
    query_vec = model.encode([query]).astype(np.float32)
    distances, indices = index.search(query_vec, top_k)

    results = []
    seen_chapters = set()

    for i, idx in enumerate(indices[0]):
        if idx < len(chunks):
            chunk   = chunks[idx]
            chapter = chunk["chapter"]

            # Skip duplicate chapters — keep best match only
            if chapter in seen_chapters:
                continue
            seen_chapters.add(chapter)

            results.append({
                "chapter": chapter,
                "text":    trim_to_sentences(chunk["text"], max_words=80),
                "score":   float(distances[0][i]),
                "rank":    len(results) + 1,
            })

    return results

if __name__ == "__main__":
    if not os.path.exists(INDEX_PATH):
        print(json.dumps({"error": "Run build_index.py first"}))
        sys.exit(1)

    query   = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "merge sort"
    results = search(query)
    print(json.dumps(results, indent=2))