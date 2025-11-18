import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import gameRoutes from "./routes/gameRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// -----------------------
// Middleware
// -----------------------
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (dev-friendly)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// -----------------------
// Routes
// -----------------------
app.use("/api/game", gameRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// -----------------------
// Error Handler
// -----------------------
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// -----------------------
// 404 Handler
// -----------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

// -----------------------
// Start Server
// -----------------------
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌎 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔗 Allowed client: ${CLIENT_URL}`);
  });
}
export default app;
