require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connectDB, disconnectDB } = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const evidenceRoutes = require("./src/routes/evidenceRoutes");
const errorHandler = require("./src/middleware/error.middleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the Secure Justice API");
});
app.use("/api/auth", authRoutes);
app.use("/api", evidenceRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  await disconnectDB();
  process.exit(0);
});
