import express from "express";
import cors from "cors";
import airoutes from "./routes/airoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", airoutes);

// Health check
app.get("/", (req, res) => {
  res.send("AI DB Backend is running");
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
