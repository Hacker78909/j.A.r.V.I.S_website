import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function AnimeTracker() {
  const animeList = useQuery(api.anime.list) || [];
  const addAnime = useMutation(api.anime.add);
  const rateAnime = useMutation(api.anime.rate);
  
  const [newAnime, setNewAnime] = useState({
    title: "",
    type: "anime",
    status: "watching",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnime.title.trim()) return;
    
    try {
      await addAnime({
        title: newAnime.title,
        type: newAnime.type,
        status: newAnime.status,
      });
      setNewAnime({
        title: "",
        type: "anime",
        status: "watching",
      });
    } catch (error) {
      console.error("Failed to add show:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Add New Show</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={newAnime.title}
            onChange={(e) =>
              setNewAnime({ ...newAnime, title: e.target.value })
            }
            className="w-full p-2 bg-gray-700 rounded"
            placeholder="Show title..."
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              value={newAnime.type}
              onChange={(e) =>
                setNewAnime({ ...newAnime, type: e.target.value })
              }
              className="w-full p-2 bg-gray-700 rounded"
            >
              <option value="anime">Anime</option>
              <option value="cartoon">Cartoon</option>
            </select>
            <select
              value={newAnime.status}
              onChange={(e) =>
                setNewAnime({ ...newAnime, status: e.target.value })
              }
              className="w-full p-2 bg-gray-700 rounded"
            >
              <option value="watching">Watching</option>
              <option value="completed">Completed</option>
              <option value="plan_to_watch">Plan to Watch</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full p-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            Add Show
          </button>
        </form>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-xl font-bold mb-4">My Watch List</h3>
        <div className="space-y-4">
          {animeList.map((show) => (
            <div key={show._id} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="text-lg font-semibold">{show.title}</h4>
                  <span className="text-sm text-gray-400">{show.type}</span>
                </div>
                <span className="px-2 py-1 bg-blue-600 rounded text-sm">
                  {show.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span>Rating:</span>
                <select
                  value={show.rating || ""}
                  onChange={(e) =>
                    rateAnime({
                      id: show._id,
                      rating: parseInt(e.target.value),
                    })
                  }
                  className="p-1 bg-gray-600 rounded"
                >
                  <option value="">Rate</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              {show.streamingLinks && (
                <div className="flex flex-wrap gap-2">
                  {show.streamingLinks.map((link) => (
                    <a
                      key={link.site}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors"
                    >
                      {link.site}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
