import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function AnimeTracker() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAnime, setNewAnime] = useState({
    title: "",
    type: "anime" as "anime" | "tv" | "movie",
    status: "plan_to_watch" as "watching" | "completed" | "plan_to_watch" | "dropped" | "on_hold",
    currentEpisode: 0,
    totalEpisodes: undefined as number | undefined,
    genre: [] as string[],
    season: "",
    year: new Date().getFullYear(),
  });

  const animeList = useQuery(api.anime.list, {});
  const animeStats = useQuery(api.anime.getStats);
  const addAnime = useMutation(api.anime.add);
  const updateStatus = useMutation(api.anime.updateStatus);
  const rateAnime = useMutation(api.anime.rate);
  const removeAnime = useMutation(api.anime.remove);

  const handleAddAnime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnime.title.trim()) return;

    try {
      await addAnime({
        title: newAnime.title,
        type: newAnime.type,
        status: newAnime.status,
        episodes: {
          current: newAnime.currentEpisode,
          total: newAnime.totalEpisodes,
        },
        genre: newAnime.genre,
        season: newAnime.season || undefined,
        year: newAnime.year || undefined,
      });

      setNewAnime({
        title: "",
        type: "anime",
        status: "plan_to_watch",
        currentEpisode: 0,
        totalEpisodes: undefined,
        genre: [],
        season: "",
        year: new Date().getFullYear(),
      });
      setShowAddForm(false);
      toast.success("Anime added!");
    } catch (error) {
      console.error("Error adding anime:", error);
      toast.error("Failed to add anime");
    }
  };

  const handleStatusUpdate = async (id: string, status: any, currentEpisode?: number) => {
    try {
      await updateStatus({ id: id as any, status, currentEpisode });
      toast.success("Status updated!");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "watching": return "bg-green-500";
      case "completed": return "bg-blue-500";
      case "plan_to_watch": return "bg-yellow-500";
      case "dropped": return "bg-red-500";
      case "on_hold": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "watching": return "Watching";
      case "completed": return "Completed";
      case "plan_to_watch": return "Plan to Watch";
      case "dropped": return "Dropped";
      case "on_hold": return "On Hold";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-sm font-medium text-gray-300">Total</h3>
          <div className="text-2xl font-bold text-white">{animeStats?.total || 0}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-sm font-medium text-gray-300">Watching</h3>
          <div className="text-2xl font-bold text-green-400">{animeStats?.watching || 0}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-sm font-medium text-gray-300">Completed</h3>
          <div className="text-2xl font-bold text-blue-400">{animeStats?.completed || 0}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-sm font-medium text-gray-300">Plan to Watch</h3>
          <div className="text-2xl font-bold text-yellow-400">{animeStats?.planToWatch || 0}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-sm font-medium text-gray-300">Dropped</h3>
          <div className="text-2xl font-bold text-red-400">{animeStats?.dropped || 0}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-sm font-medium text-gray-300">Avg Rating</h3>
          <div className="text-2xl font-bold text-purple-400">{animeStats?.averageRating || 0}</div>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">My Anime List</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors"
        >
          {showAddForm ? "Cancel" : "Add Anime"}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <form onSubmit={handleAddAnime} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={newAnime.title}
                  onChange={(e) => setNewAnime({ ...newAnime, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="Anime title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <select
                  value={newAnime.type}
                  onChange={(e) => setNewAnime({ ...newAnime, type: e.target.value as any })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="anime">Anime</option>
                  <option value="tv">TV Show</option>
                  <option value="movie">Movie</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={newAnime.status}
                  onChange={(e) => setNewAnime({ ...newAnime, status: e.target.value as any })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="plan_to_watch">Plan to Watch</option>
                  <option value="watching">Watching</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                <input
                  type="number"
                  value={newAnime.year}
                  onChange={(e) => setNewAnime({ ...newAnime, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="2024"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors"
            >
              Add Anime
            </button>
          </form>
        </div>
      )}

      {/* Anime List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {animeList?.map((anime) => (
          <div key={anime._id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-white text-lg">{anime.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(anime.status)}`}>
                {getStatusLabel(anime.status)}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-300">
              <p>Type: {anime.type}</p>
              <p>Episodes: {anime.episodes.current}{anime.episodes.total ? `/${anime.episodes.total}` : ""}</p>
              {anime.year && <p>Year: {anime.year}</p>}
              {anime.rating && <p>Rating: {anime.rating}/10</p>}
            </div>

            <div className="mt-4 flex space-x-2">
              <select
                value={anime.status}
                onChange={(e) => handleStatusUpdate(anime._id, e.target.value)}
                className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="plan_to_watch">Plan to Watch</option>
                <option value="watching">Watching</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {animeList?.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📺</div>
          <h3 className="text-xl font-semibold text-white mb-2">No anime tracked yet</h3>
          <p className="text-gray-400">Add your first anime to start tracking!</p>
        </div>
      )}
    </div>
  );
}
