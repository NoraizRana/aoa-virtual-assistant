require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const authRoutes     = require("./routes/authRoutes");
const topicRoutes    = require("./routes/topicRoutes");
const queryRoutes    = require("./routes/queryRoutes");
const progressRoutes = require("./routes/progressRoutes");

const app = express();

connectDB();

// ✅ CORS fix for Express v5 / new path-to-regexp
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use("/auth",     authRoutes);
app.use("/topics",   topicRoutes);
app.use("/query",    queryRoutes);
app.use("/progress", progressRoutes);

app.get("/", (req, res) => {
  res.json({ message: "✅ AoA Assistant Backend is running!" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});