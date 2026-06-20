import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const API_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.port === "3001" ? "http://localhost:3000" : "");

const defaultRoomForm = {
  name: "",
  hobby: "",
  topic: ""
};

function formatTime(value) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function App() {
  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState(() => localStorage.getItem("studyUserName") || "");
  const [message, setMessage] = useState("");
  const [roomForm, setRoomForm] = useState(defaultRoomForm);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  const activeRoom = useMemo(
    () => rooms.find((room) => room.id === activeRoomId),
    [activeRoomId, rooms]
  );

  const request = useCallback(async (path, options) => {
    const response = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong.");
    }

    return data;
  }, []);

  const loadRooms = useCallback(async () => {
    try {
      const data = await request("/api/rooms");
      setRooms(data);
      setActiveRoomId((currentId) => currentId || data[0]?.id || null);
      setError("");
    } catch (err) {
      setError("Could not load rooms. Check that the backend server is running.");
    }
  }, [request]);

  const loadMessages = useCallback(async (roomId) => {
    if (!roomId) return;

    try {
      const data = await request(`/api/rooms/${roomId}/messages`);
      setMessages(data);
      setError("");
    } catch (err) {
      setError("Could not load messages for this room.");
    }
  }, [request]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    loadMessages(activeRoomId);

    const intervalId = setInterval(() => {
      loadMessages(activeRoomId);
      loadRooms();
    }, 4000);

    return () => clearInterval(intervalId);
  }, [activeRoomId, loadMessages, loadRooms]);

  useEffect(() => {
    localStorage.setItem("studyUserName", name);
  }, [name]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(event) {
    event.preventDefault();

    if (!activeRoomId || !name.trim() || !message.trim()) {
      setError("Choose a room, enter your name, and write a message.");
      return;
    }

    try {
      const savedMessage = await request(`/api/rooms/${activeRoomId}/messages`, {
        method: "POST",
        body: JSON.stringify({ author: name, text: message })
      });

      setMessages((currentMessages) => [...currentMessages, savedMessage]);
      setMessage("");
      setError("");
      loadRooms();
    } catch (err) {
      setError(err.message);
    }
  }

  async function createRoom(event) {
    event.preventDefault();

    try {
      const newRoom = await request("/api/rooms", {
        method: "POST",
        body: JSON.stringify(roomForm)
      });

      setRooms((currentRooms) => [...currentRooms, newRoom]);
      setActiveRoomId(newRoom.id);
      setRoomForm(defaultRoomForm);
      setIsCreatingRoom(false);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Study Social</p>
          <h1>Study rooms for classes and hobbies</h1>
        </div>
        <label className="name-field">
          <span>Your name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Filip"
            maxLength="40"
          />
        </label>
      </header>

      {error && <div className="notice">{error}</div>}

      <main className="workspace">
        <aside className="rooms-panel">
          <div className="panel-heading">
            <div>
              <h2>Rooms</h2>
              <p>{rooms.length} active topics</p>
            </div>
            <button
              className="icon-button"
              title="Create room"
              type="button"
              onClick={() => setIsCreatingRoom((value) => !value)}
            >
              +
            </button>
          </div>

          {isCreatingRoom && (
            <form className="create-room" onSubmit={createRoom}>
              <input
                value={roomForm.name}
                onChange={(event) => setRoomForm({ ...roomForm, name: event.target.value })}
                placeholder="Room name"
                maxLength="50"
              />
              <input
                value={roomForm.hobby}
                onChange={(event) => setRoomForm({ ...roomForm, hobby: event.target.value })}
                placeholder="Hobby or subject"
                maxLength="40"
              />
              <textarea
                value={roomForm.topic}
                onChange={(event) => setRoomForm({ ...roomForm, topic: event.target.value })}
                placeholder="What will people discuss here?"
                maxLength="140"
              />
              <button type="submit">Create</button>
            </form>
          )}

          <div className="room-list">
            {rooms.map((room) => (
              <button
                className={`room-card ${room.id === activeRoomId ? "active" : ""}`}
                key={room.id}
                type="button"
                onClick={() => setActiveRoomId(room.id)}
              >
                <span className="room-meta">{room.hobby}</span>
                <strong>{room.name}</strong>
                <span>{room.topic}</span>
                <small>
                  {room.members} members | {room.messageCount} messages
                </small>
              </button>
            ))}
          </div>
        </aside>

        <section className="chat-panel">
          {activeRoom ? (
            <>
              <div className="chat-heading">
                <div>
                  <span className="room-meta">{activeRoom.hobby}</span>
                  <h2>{activeRoom.name}</h2>
                  <p>{activeRoom.topic}</p>
                </div>
              </div>

              <div className="messages" aria-live="polite">
                {messages.length === 0 ? (
                  <div className="empty-state">Start the first conversation in this room.</div>
                ) : (
                  messages.map((item) => (
                    <article className="message" key={item.id}>
                      <div className="avatar" aria-hidden="true">
                        {item.author.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="message-meta">
                          <strong>{item.author}</strong>
                          <span>{formatTime(item.createdAt)}</span>
                        </div>
                        <p>{item.text}</p>
                      </div>
                    </article>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <form className="composer" onSubmit={sendMessage}>
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Write a helpful message..."
                  maxLength="500"
                />
                <button type="submit">Send</button>
              </form>
            </>
          ) : (
            <div className="empty-state">Create a room to start studying together.</div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
