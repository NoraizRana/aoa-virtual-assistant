🎓 AoA AI Tutor

Voice-Enabled Domain-Specific AI Teaching Assistant for Analysis of Algorithms

---

🚀 Overview

AoA AI Tutor is a web-based intelligent teaching assistant designed specifically for the Analysis of Algorithms (AoA) domain.

Unlike traditional chatbots, this system does not rely on external AI APIs. Instead, it uses a custom-built knowledge base, NLP pipeline, and retrieval system to understand and answer user queries.

The system supports both text and voice interaction, making it an interactive learning tool for students.

---

🎯 Features

🧠 Intelligent Query Understanding

- Understands user intent (concept, comparison, problem-solving)
- Handles AoA-specific queries only
- Uses structured dataset + similarity matching

🎤 Voice Interaction (Core Feature)

- Speech-to-Text using Web Speech API
- Text-to-Speech responses
- Real-time voice chatbot experience

📚 Domain-Specific Knowledge

- Covers full AoA syllabus:
  - Sorting Algorithms
  - Divide & Conquer
  - Recurrences
  - Dynamic Programming
  - Greedy Algorithms
  - Graph Algorithms

🧩 Structured Responses

- Topic-based explanation
- Step-by-step solutions
- Time & Space complexity
- Examples and reasoning

📊 Progress Tracking

- Stores user queries
- Tracks learning history

🔐 Authentication System

- JWT-based login/signup
- Role-based access (Admin / Student)

---

🏗️ Tech Stack

Frontend

- React.js
- Tailwind CSS
- Web Speech API

Backend

- Node.js
- Express.js

Database

- MongoDB

AI / NLP

- TF-IDF / Cosine Similarity
- Custom dataset (no external APIs)

---

🧠 System Architecture

User (Voice/Text)
↓
React Frontend
↓
Speech-to-Text
↓
Express API
↓
Query Processing Engine
↓
MongoDB Knowledge Base
↓
Response Generator
↓
Frontend
↓
Text-to-Speech

---

📂 Project Structure

aoa-ai-tutor/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   └── services/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── config/
│
├── dataset/
│   ├── topics.json
│   ├── qa_pairs.json
│   └── problems.json
│
├── ai-engine/
│   ├── similarity.js
│   ├── intentClassifier.js
│   └── responseGenerator.js
│
└── README.md

---

⚙️ Installation & Setup

1. Clone Repository

git clone https://github.com/your-username/aoa-ai-tutor.git
cd aoa-ai-tutor

2. Backend Setup

cd backend
npm install

Create ".env" file:

PORT=5000
MONGO_URI=mongodb://localhost:27017/aoa_assistant
JWT_SECRET=your_secret_key

Run backend:

npm run dev

---

3. Frontend Setup

cd frontend
npm install
npm start

---

🎤 Voice Features

- Click microphone to start speaking
- Converts speech → text
- Sends query to backend
- AI response is read aloud using Text-to-Speech

---

🧪 Sample Queries

- "Explain merge sort"
- "Quick sort vs merge sort"
- "Solve T(n) = 2T(n/2) + n"
- "What is time complexity of BFS?"

---

📈 Future Improvements

- Advanced NLP 
- Mathematical solver integration
- Self-learning system from user queries
- Improved intent classification

---

👨‍💻 Author

Noraiz Rana
BS Information Technology – Final Year Project

---

📜 License

MIT.
