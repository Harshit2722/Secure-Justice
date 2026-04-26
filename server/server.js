require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connectDB, disconnectDB } = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const evidenceRoutes = require("./src/routes/evidenceRoutes");
const userRoutes = require("./src/routes/userRoutes");
// Fir routes
const firRoutes = require("./src/routes/firRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const errorHandler = require("./src/middleware/error.middleware");


const app = express();
 
// Add this to create uploads folder if it doesn't exist
const fs = require('fs');
const dir = './uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));


// Connect to MongoDB
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the Secure Justice API");
});

app.use("/api/fir", firRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", evidenceRoutes);
app.use("/api/notifications", notificationRoutes);

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
