import { useState, useEffect } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";

export function GameMaker() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Id<"pythonGames"> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const generateGame = useAction(api.creator.generatePythonGame);
  const deleteGame = useMutation(api.creator.deletePythonGame);
  const games = useQuery(api.creator.listPythonGames) || [];

  const handleVoiceInput = () => {
    if (!window.webkitSpeechRecognition) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDescription(transcript);
    };

    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      await generateGame({ title, description });
      setTitle("");
      setDescription("");
      toast.success("Game generated successfully!");
    } catch (error) {
      toast.error("Failed to generate game");
    }
  };

  const handleDelete = async (id: Id<"pythonGames">) => {
    try {
      await deleteGame({ id });
      if (selectedGame === id) {
        setSelectedGame(null);
        setIsPlaying(false);
      }
      toast.success("Game deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete game");
    }
  };

  const handleDownload = (code: string, filename: string) => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedGameData = selectedGame ? games.find((g) => g._id === selectedGame) : null;

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Python Game Generator</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Game title..."
            className="w-full p-2 bg-gray-700 rounded"
          />
          <div className="flex gap-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your game..."
              className="flex-1 p-2 bg-gray-700 rounded h-32"
            />
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-2 rounded ${
                isListening ? "bg-red-600" : "bg-blue-600"
              }`}
            >
              {isListening ? "Listening..." : "🎤"}
            </button>
          </div>
          <button
            type="submit"
            className="w-full p-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Generate Game
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Game List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Game History</h3>
          {games.map((game) => (
            <div
              key={game._id}
              className={`bg-gray-800 p-6 rounded-lg cursor-pointer transition-colors ${
                selectedGame === game._id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedGame(game._id)}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{game.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(game.code, game.title);
                    }}
                    className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Download
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(game._id);
                    }}
                    className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-gray-400 mb-4">{game.description}</p>
              <div className="text-sm text-gray-500">
                Created: {new Date(game.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Game Preview */}
        <div className="bg-gray-800 p-6 rounded-lg sticky top-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">
              {isPlaying ? "Game Preview" : "Code Preview"}
            </h3>
            {selectedGameData && (
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
              >
                {isPlaying ? "View Code" : "Play Game"}
              </button>
            )}
          </div>
          <div className="bg-gray-900 p-4 rounded overflow-auto max-h-[600px]">
            {selectedGameData ? (
              isPlaying ? (
                <div className="bg-white rounded-lg p-4">
                  <iframe
                    src={`data:text/html;charset=utf-8,
                      <html>
                        <head>
                          <script src="https://cdn.jsdelivr.net/npm/pygame-js/dist/pygame.min.js"></script>
                          <style>
                            canvas { background: black; }
                            body { margin: 0; display: flex; justify-content: center; }
                          </style>
                        </head>
                        <body>
                          <script>
                            ${selectedGameData.code}
                          </script>
                        </body>
                      </html>
                    `}
                    className="w-full h-[500px] border-0"
                    sandbox="allow-scripts"
                  />
                </div>
              ) : (
                <pre className="text-sm">
                  <code>{selectedGameData.code}</code>
                </pre>
              )
            ) : (
              <p className="text-gray-500 text-center py-8">
                Select a game to view its code or play
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
