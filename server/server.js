require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB, disconnectDB } = require('./src/config/db');

require("./src/models/User");
const app = express();
 
app.use(express.json());

//Fir routes
const firRoutes = require("./src/routes/firRoutes");

app.use("/api/fir", firRoutes);

// Middleware
app.use(cors());
app.use(express.json());



// Connect to MongoDB
connectDB();

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the Secure Justice API');
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    await disconnectDB();
    process.exit(0);
});

