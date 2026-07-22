const mongoose = require("mongoose");
require("dotenv").config();
const Todo = require("./models/Todo");
const User = require("./models/User");

const initialTodos = [
  { text: "Sleep on Grass", completed: false },
  { text: "Feed the Chicken", completed: true },
  { text: "Go for a walk", completed: false },
  { text: "Collect fresh eggs", completed: false }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    await User.deleteMany({});
    await Todo.deleteMany({});
    console.log("Cleared existing data.");

    const testUser = new User({
      email: "test@example.com",
      password: "password123"
    });
    await testUser.save();
    console.log("Created test user: test@example.com / password123");

    const todosToInsert = initialTodos.map(todo => ({
      userEmail: testUser.email,
      text: todo.text,
      completed: todo.completed
    }));

    await Todo.insertMany(todosToInsert);
    console.log("Seeded database with initial todos successfully!");

    mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

seedDB();
