const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Backend radi 🚀");
});

// dummy data
let rooms = [
  { id: 1, name: "Algoritmi" },
  { id: 2, name: "Baze podataka" }
];

// get rooms
app.get("/rooms", (req, res) => {
  res.json(rooms);
});

// join room
app.post("/join", (req, res) => {
  res.json({ message: "Joined room!" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
