import pdfplumber
import numpy as np
import faiss
import pickle
import re
import os
from sentence_transformers import SentenceTransformer

PDF_PATH    = "../data/Introduction_to_Algorithms.pdf"
INDEX_PATH  = "../data/faiss_index.bin"
CHUNKS_PATH = "../data/chunks.pkl"
PDF_OFFSET  = 21

COURSE_PAGES = {
    "Role of Algorithms":        (1,   15),
    "Asymptotic Notation":       (43,  64),
    "Divide and Conquer":        (65,  82),
    "Recurrences":               (83, 113),
    "Heapsort":                 (151, 169),
    "Quicksort":                (170, 190),
    "Sorting in Linear Time":   (191, 212),
    "Binary Search Trees":      (286, 307),
    "Red-Black Trees":          (308, 338),
    "Dynamic Programming":      (359, 413),
    "Greedy Algorithms":        (414, 449),
    "Graph Algorithms BFS DFS": (589, 623),
    "Minimum Spanning Trees":   (624, 642),
    "Shortest Paths Dijkstra":  (643, 683),
}

def clean_text(text):
    # Remove non-ASCII characters and PDF artifacts
    text = re.sub(r'[^\x20-\x7E\n]', ' ', text)
    # Remove (cid:X) artifacts
    text = re.sub(r'\(cid:\d+\)', '', text)
    # Fix broken words (single char on new line)
    text = re.sub(r'\n([a-z])\n', r'\1', text)
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove very short tokens (PDF noise)
    words = [w for w in text.split() if len(w) > 1]
    return ' '.join(words).strip()

def is_good_chunk(text):
    """Filter out low quality chunks"""
    words = text.split()
    if len(words) < 30:
        return False
    # Skip chunks that are mostly numbers/symbols
    alpha_ratio = sum(c.isalpha() for c in text) / max(len(text), 1)
    if alpha_ratio < 0.5:
        return False
    return True

def extract_chunks(pdf_path, chunk_size=150):
    chunks = []
    print(f"Opening PDF...")

    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        print(f"Total pages: {total_pages}")

        for chapter, (start, end) in COURSE_PAGES.items():
            print(f"  Processing: {chapter}")
            chapter_text = ""

            for pg in range(start + PDF_OFFSET,
                           min(end + PDF_OFFSET + 1, total_pages)):
                page_text = pdf.pages[pg].extract_text()
                if page_text:
                    chapter_text += clean_text(page_text) + " "

            # Split into smaller focused chunks
            words = chapter_text.split()
            step  = chunk_size // 2  # 50% overlap

            for i in range(0, len(words), step):
                chunk_words = words[i:i + chunk_size]
                chunk_text  = ' '.join(chunk_words)

                if is_good_chunk(chunk_text):
                    chunks.append({
                        "chapter": chapter,
                        "text":    chunk_text,
                    })

    print(f"\nTotal quality chunks: {len(chunks)}")
    return chunks

def build_faiss_index(chunks):
    print("\nLoading embedding model...")
    model = SentenceTransformer("all-MiniLM-L6-v2")

    print("Creating embeddings...")
    texts      = [c["text"] for c in chunks]
    embeddings = model.encode(
        texts,
        show_progress_bar=True,
        batch_size=32
    )

    dimension = embeddings.shape[1]
    index     = faiss.IndexFlatL2(dimension)
    index.add(embeddings.astype(np.float32))

    faiss.write_index(index, INDEX_PATH)
    with open(CHUNKS_PATH, "wb") as f:
        pickle.dump(chunks, f)

    print(f"\nIndex saved — {index.ntotal} vectors")

if __name__ == "__main__":
    if not os.path.exists(PDF_PATH):
        print(f"ERROR: PDF not found at {PDF_PATH}")
        exit(1)

    print("Building clean RAG index...")
    chunks = extract_chunks(PDF_PATH)
    build_faiss_index(chunks)
    print("Done!")