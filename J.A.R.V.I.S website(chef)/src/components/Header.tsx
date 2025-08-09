interface HeaderProps {
  currentView: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ currentView, sidebarOpen, setSidebarOpen }: HeaderProps) {
  const getViewTitle = (view: string) => {
    const titles: Record<string, string> = {
      dashboard: "Dashboard",
      chat: "Chat with JARVIS",
      todos: "Todo List",
      notes: "Sticky Notes",
      anime: "Anime Tracker",
      games: "Game Generator",
      images: "Image Generator",
      code: "Code Assistant",
      calendar: "Calendar",
      analytics: "Analytics",
    };
    return titles[view] || "JARVIS";
  };

  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:text-blue-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 className="text-2xl font-bold text-white">
            {getViewTitle(currentView)}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-300">
            {new Date().toLocaleDateString()}
          </div>
          
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
