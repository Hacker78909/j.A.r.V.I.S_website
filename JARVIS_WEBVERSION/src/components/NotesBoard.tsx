import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function NotesBoard() {
  const notes = useQuery(api.notes.list) || [];
  const createNote = useMutation(api.notes.create);
  const [newNote, setNewNote] = useState("");

  const colors = ["bg-yellow-500", "bg-pink-500", "bg-green-500", "bg-blue-500"];

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Sticky Notes</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newNote.trim()) return;
          createNote({
            content: newNote,
            color: colors[Math.floor(Math.random() * colors.length)],
            position: { x: Math.random() * 100, y: Math.random() * 100 },
          });
          setNewNote("");
        }}
        className="mb-4"
      >
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
          placeholder="Add new note..."
        />
      </form>
      <div className="grid grid-cols-2 gap-4">
        {notes.map((note) => (
          <div
            key={note._id}
            className={`${note.color} p-4 rounded-lg shadow-lg`}
            style={{
              transform: `translate(${note.position.x}%, ${note.position.y}%)`,
            }}
          >
            {note.content}
          </div>
        ))}
      </div>
    </div>
  );
}
