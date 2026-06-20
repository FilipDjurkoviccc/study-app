import { useEffect, useState } from "react";

function App() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetch("http://YOUR_EC2_IP:3000/rooms")
      .then(res => res.json())
      .then(data => setRooms(data));
  }, []);

  return (
    <div>
      <h1>Study Rooms</h1>
      {rooms.map(r => (
        <div key={r.id}>{r.name}</div>
      ))}
    </div>
  );
}

export default App;