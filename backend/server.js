//server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('../models/User');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connecting to MongoDB
const MONGO_URI = "mongodb+srv://admin:admin@cluster0.yfvd9iw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Routes
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password, location } = req.body;
    const user = new User({ name, email, password, location });
    await user.save();
    res.status(201).json({ message: 'User signed up successfully' });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
