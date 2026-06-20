const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let rooms = [
  {
    id: 1,
    name: "Algorithms",
    topic: "Study data structures, coding tasks, and exam problems.",
    hobby: "Programming",
    members: 8,
    messages: [
      {
        id: 1,
        author: "Mina",
        text: "Does anyone want to review graph traversal today?",
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
      },
      {
        id: 2,
        author: "Filip",
        text: "Yes, I can share DFS notes after lunch.",
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      }
    ]
  },
  {
    id: 2,
    name: "Databases",
    topic: "SQL, database design, normalization, and queries.",
    hobby: "Backend",
    members: 5,
    messages: [
      {
        id: 1,
        author: "Ana",
        text: "I am practicing joins if someone wants to compare solutions.",
        createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString()
      }
    ]
  },
  {
    id: 3,
    name: "Music Theory",
    topic: "Talk about instruments, chords, practice habits, and favorite songs.",
    hobby: "Music",
    members: 11,
    messages: [
      {
        id: 1,
        author: "Marko",
        text: "What is your favorite way to memorize scales?",
        createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString()
      }
    ]
  },
  {
    id: 4,
    name: "Gaming & Strategy",
    topic: "Discuss games, teamwork, tactics, and balancing study with hobbies.",
    hobby: "Gaming",
    members: 14,
    messages: [
      {
        id: 1,
        author: "Sara",
        text: "Anyone here using game theory examples for math revision?",
        createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
      }
    ]
  }
];

function roomSummary(room) {
  const lastMessage = room.messages[room.messages.length - 1];

  return {
    id: room.id,
    name: room.name,
    topic: room.topic,
    hobby: room.hobby,
    members: room.members,
    messageCount: room.messages.length,
    lastMessage: lastMessage || null
  };
}

function findRoom(id) {
  return rooms.find((room) => room.id === Number(id));
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "study-social" });
});

app.get("/rooms", (req, res) => {
  res.json(rooms.map(roomSummary));
});

app.get("/api/rooms", (req, res) => {
  res.json(rooms.map(roomSummary));
});

app.post("/api/rooms", (req, res) => {
  const name = String(req.body.name || "").trim();
  const topic = String(req.body.topic || "").trim();
  const hobby = String(req.body.hobby || "").trim();

  if (!name || !topic || !hobby) {
    return res.status(400).json({ message: "Name, topic, and hobby are required." });
  }

  const newRoom = {
    id: rooms.length ? Math.max(...rooms.map((room) => room.id)) + 1 : 1,
    name,
    topic,
    hobby,
    members: 1,
    messages: []
  };

  rooms.push(newRoom);
  res.status(201).json(roomSummary(newRoom));
});

app.get("/api/rooms/:id", (req, res) => {
  const room = findRoom(req.params.id);

  if (!room) {
    return res.status(404).json({ message: "Room not found." });
  }

  res.json(roomSummary(room));
});

app.get("/api/rooms/:id/messages", (req, res) => {
  const room = findRoom(req.params.id);

  if (!room) {
    return res.status(404).json({ message: "Room not found." });
  }

  res.json(room.messages);
});

app.post("/api/rooms/:id/messages", (req, res) => {
  const room = findRoom(req.params.id);
  const author = String(req.body.author || "").trim();
  const text = String(req.body.text || "").trim();

  if (!room) {
    return res.status(404).json({ message: "Room not found." });
  }

  if (!author || !text) {
    return res.status(400).json({ message: "Author and message text are required." });
  }

  const message = {
    id: room.messages.length ? Math.max(...room.messages.map((item) => item.id)) + 1 : 1,
    author: author.slice(0, 40),
    text: text.slice(0, 500),
    createdAt: new Date().toISOString()
  };

  room.messages.push(message);
  res.status(201).json(message);
});

app.post("/join", (req, res) => {
  const room = findRoom(req.body.roomId);

  if (room) {
    room.members += 1;
  }

  res.json({ message: "Joined room!" });
});

const frontendBuildPath = path.join(__dirname, "..", "frontend", "build");
app.use(express.static(frontendBuildPath));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendBuildPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Study app server running on port ${PORT}`);
});
