const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/todos", require("./routes/todos"));

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
