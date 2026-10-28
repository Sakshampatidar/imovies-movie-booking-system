import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./src/routes/auth.js";
import movieRoutes from "./src/routes/movies.js";
import bookingRoutes from "./src/routes/bookings.js";

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok", app: "iMovies API" }));
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/bookings", bookingRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(port, () => console.log(`iMovies API running on http://localhost:${port}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
