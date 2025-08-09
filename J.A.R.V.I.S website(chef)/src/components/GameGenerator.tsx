import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function GameGenerator() {
  const [prompt, setPrompt] = useState("");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [gameType, setGameType] = useState("arcade");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const games = useQuery(api.games.list, {});
  const generateGame = useAction(api.games.generateGame);
  const saveGame = useMutation(api.games.saveGame);
  const deleteGame = useMutation(api.games.deleteGame);
  const selectedGameData = useQuery(api.games.getGame, 
    selectedGame ? { id: selectedGame as any } : "skip"
  );

  const gameTypes = [
    "arcade", "puzzle", "adventure", "strategy", "simulation", "educational"
  ];

  const handleGenerateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const result = await generateGame({
        prompt,
        difficulty,
        gameType,
      });
      
      toast.success("Game generated successfully!");
      setPrompt("");
      setSelectedGame(result.gameId);
    } catch (error) {
      console.error("Error generating game:", error);
      toast.error("Failed to generate game");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    try {
      await deleteGame({ id: gameId as any });
      toast.success("Game deleted!");
      if (selectedGame === gameId) {
        setSelectedGame(null);
      }
    } catch (error) {
      console.error("Error deleting game:", error);
      toast.error("Failed to delete game");
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Generator Form */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">🎮 Python Game Generator</h2>
        <p className="text-gray-300 mb-6">
          Generate complete Python games using AI. Describe what kind of game you want and I'll create it for you!
        </p>
        
        <form onSubmit={handleGenerateGame} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Game Description
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the game you want to create... (e.g., 'A simple Snake game with colorful graphics' or 'A math quiz game for kids')"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Game Type
              </label>
              <select
                value={gameType}
                onChange={(e) => setGameType(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {gameTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
          >
            {isGenerating ? "Generating Game..." : "Generate Game"}
          </button>
        </form>
      </div>

      {/* Games List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Games Library */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Your Games</h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {games?.map((game) => (
              <div
                key={game._id}
                className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                  selectedGame === game._id
                    ? "bg-blue-500/20 border-blue-500/50"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
                onClick={() => setSelectedGame(game._id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{game.title}</h4>
                    <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                      {game.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        game.difficulty === "beginner" ? "bg-green-500/20 text-green-300" :
                        game.difficulty === "intermediate" ? "bg-yellow-500/20 text-yellow-300" :
                        "bg-red-500/20 text-red-300"
                      }`}>
                        {game.difficulty}
                      </span>
                      {game.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGame(game._id);
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors ml-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 102 0v3a1 1 0 11-2 0V9zm4 0a1 1 0 10-2 0v3a1 1 0 102 0V9z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {games?.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎮</div>
              <p className="text-gray-400">No games generated yet</p>
              <p className="text-sm text-gray-500 mt-1">Create your first game to get started!</p>
            </div>
          )}
        </div>

        {/* Code Viewer */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Game Code</h3>
            {selectedGameData && (
              <button
                onClick={() => copyToClipboard(selectedGameData.code)}
                className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-green-300 text-sm transition-colors"
              >
                Copy Code
              </button>
            )}
          </div>
          
          {selectedGameData ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">{selectedGameData.title}</h4>
                <p className="text-sm text-gray-300">{selectedGameData.description}</p>
              </div>
              
              <div className="bg-black/30 rounded-lg p-4 max-h-96 overflow-auto">
                <pre className="text-sm text-green-400 whitespace-pre-wrap">
                  <code>{selectedGameData.code}</code>
                </pre>
              </div>
              
              <div className="text-xs text-gray-400">
                <p>💡 Copy this code and save it as a .py file to run the game!</p>
                <p>Make sure you have the required libraries installed (pygame, tkinter, etc.)</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">👈</div>
              <p className="text-gray-400">Select a game to view its code</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
