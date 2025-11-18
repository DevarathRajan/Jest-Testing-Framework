import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import gameRoutes from "./routes/gameRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Add game routes
app.use("/api/game", gameRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
