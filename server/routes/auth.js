const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({ email, password });
    await newUser.save();

    res.status(201).json({ message: "Registration successful", email: newUser.email });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.status(200).json({ message: "Login successful", email: user.email });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
