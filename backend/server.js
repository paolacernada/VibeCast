const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const bcrypt = require('bcrypt');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Connecting to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('error', err => {
  console.error("Uh-oh, seems like we're having a bit of a tiff with MongoDB:", err);
});

app.post('/signup', async (req, res) => {
  try {
    const { name, email, password, location } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Looks like you're already vibing with us. Try logging in instead!" });
    }

    const user = new User({ name, email, password, location });
    await user.save();
    res.status(201).json({ message: "Welcome to the party! Let's set the vibe 🎉" });
  } catch (error) {
    res.status(500).json({ error: "Our server's got the blues. Give it another whirl?" });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Hmmm, can't seem to find you. Are you sure you're on the list?" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      res.status(200).json({ message: "And you're in! What's the vibe today?" });
    } else {
      res.status(401).json({ message: "Those credentials don't seem to match our records. Shall we try again?" });
    }
  } catch (error) {
    res.status(500).json({ error: "It's not you, it's us. We'll sort this out ASAP!" });
  }
});

// Starting the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
