import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function StickyNotes() {
  const [newNote, setNewNote] = useState("");
  const [selectedColor, setSelectedColor] = useState("#fbbf24");
  
  const notes = useQuery(api.notes.list);
  const createNote = useMutation(api.notes.create);
  const updateNote = useMutation(api.notes.update);
  const deleteNote = useMutation(api.notes.remove);

  const colors = [
    "#fbbf24", // yellow
    "#fb7185", // pink
    "#60a5fa", // blue
    "#34d399", // green
    "#a78bfa", // purple
    "#f97316", // orange
  ];

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      await createNote({
        content: newNote,
        color: selectedColor,
        position: {
          x: Math.random() * 300,
          y: Math.random() * 200,
          z: Date.now(),
        },
        size: {
          width: 250,
          height: 200,
        },
        tags: [],
      });
      
      setNewNote("");
      toast.success("Note created!");
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote({ id: noteId as any });
      toast.success("Note deleted!");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Note Form */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">Create New Note</h2>
        
        <form onSubmit={handleCreateNote} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Note Content
            </label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write your note here..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Color
            </label>
            <div className="flex space-x-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? "border-white" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!newNote.trim()}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
          >
            Create Note
          </button>
        </form>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {notes?.map((note) => (
          <div
            key={note._id}
            className="relative p-4 rounded-lg shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-200"
            style={{ backgroundColor: note.color }}
          >
            <button
              onClick={() => handleDeleteNote(note._id)}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold transition-colors"
            >
              ×
            </button>
            
            <div className="pr-8">
              <p className="text-gray-800 whitespace-pre-wrap break-words">
                {note.content}
              </p>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-600/20">
              <p className="text-xs text-gray-600">
                {new Date(note.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {notes?.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-white mb-2">No notes yet</h3>
          <p className="text-gray-400">Create your first sticky note to get started!</p>
        </div>
      )}
    </div>
  );
}
