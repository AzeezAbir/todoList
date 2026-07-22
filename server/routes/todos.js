const express = require("express");
const router = express.Router();
const Todo = require("../models/Todo");

router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email parameter is required" });
    }
    const todos = await Todo.find({ userEmail: email.toLowerCase() });
    res.status(200).json(todos);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { userEmail, text } = req.body;
    if (!userEmail || !text) {
      return res.status(400).json({ message: "Email and text are required" });
    }
    const newTodo = new Todo({ userEmail, text });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { completed },
      { new: true },
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.status(200).json(updatedTodo);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTodo = await Todo.findByIdAndDelete(id);
    if (!deletedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
