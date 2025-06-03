import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TodoList } from "./TodoList";
import { NotesBoard } from "./NotesBoard";
import { ChatBot } from "./ChatBot";
import { Clock } from "./Clock";
import { QuickLaunch } from "./QuickLaunch";
import { AnimeTracker } from "./AnimeTracker";
import { GameMaker } from "./creator/GameMaker";
import { CodeBuddy } from "./creator/CodeBuddy";
import { ImageGenerator } from "./creator/ImageGenerator";
import { toast } from "sonner";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const user = useQuery(api.auth.loggedInUser);
  const exportData = useAction(api.dataExport.exportToExcel);

  if (!user) return null;

  const tabs = [
    { id: "home", name: "Home", icon: "🏠" },
    { id: "chat", name: "Chat", icon: "💬" },
    { id: "anime", name: "Anime Tracker", icon: "🎬" },
    { id: "gamemaker", name: "Game Maker", icon: "🎮" },
    { id: "codebuddy", name: "Code Buddy", icon: "💻" },
    { id: "imagegen", name: "Image Generator", icon: "🎨" },
  ];

  const handleExport = async () => {
    try {
      const blob = await exportData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jarvis_data_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Data exported successfully!");
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800/50 backdrop-blur-lg p-4 border-r border-gray-700/50">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/50">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">J.A.R.V.I.S</h2>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="w-full p-2 mt-2 bg-green-600/20 border border-green-500/50 rounded-lg text-green-400 hover:bg-green-600/30 transition-colors flex items-center justify-center gap-2"
          >
            <span>📊</span>
            <span>Export Data</span>
          </button>
        </div>
        
        <nav className="space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full p-3 text-left rounded-xl flex items-center gap-3 transition-all duration-200 ${
                activeTab === tab.id 
                  ? "bg-blue-600/20 border border-blue-500/50 text-blue-400" 
                  : "hover:bg-gray-700/50 border border-transparent"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {activeTab === "home" && (
          <div className="grid grid-cols-2 gap-6">
            <Clock />
            <QuickLaunch />
            <TodoList />
            <NotesBoard />
          </div>
        )}
        {activeTab === "chat" && <ChatBot />}
        {activeTab === "anime" && <AnimeTracker />}
        {activeTab === "gamemaker" && <GameMaker />}
        {activeTab === "codebuddy" && <CodeBuddy />}
        {activeTab === "imagegen" && <ImageGenerator />}
      </div>
    </div>
  );
}
