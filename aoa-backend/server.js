require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const connectDB = require("./db");

const authRoutes     = require("./routes/authRoutes");
const topicRoutes    = require("./routes/topicRoutes");
const queryRoutes    = require("./routes/queryRoutes");
const progressRoutes = require("./routes/progressRoutes");

const app = express();

connectDB();

// CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Routes
app.use("/auth",     authRoutes);
app.use("/topics",   topicRoutes);
app.use("/query",    queryRoutes);
app.use("/progress", progressRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "✅ AoA Assistant Backend is running!" });
});

// AI Status check
app.get("/ai-status", async (req, res) => {
  try {
    const { Ollama } = require("ollama");
    const ol     = new Ollama({ host: "http://localhost:11434" });
    const models = await ol.list();
    const names  = models.models.map(m => m.name);
    res.json({
      ollama:   "running",
      models:   names,
      aoaTutor: names.some(n => n.includes("aoa-tutor")),
    });
  } catch (err) {
    res.json({ ollama: "not running", error: err.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);

  // Check Ollama on startup
  try {
    const { Ollama } = require("ollama");
    const ol     = new Ollama({ host: "http://localhost:11434" });
    const models = await ol.list();
    const names  = models.models.map(m => m.name);
    console.log("📋 Ollama models:", names.join(", ") || "none");
    if (names.some(n => n.includes("aoa-tutor"))) {
      console.log("✅ aoa-tutor model is ready");
    } else {
      console.log("⚠️  aoa-tutor not found — run: ollama create aoa-tutor -f Modelfile");
    }
  } catch {
    console.log("⚠️  Ollama not reachable on startup");
  }
});