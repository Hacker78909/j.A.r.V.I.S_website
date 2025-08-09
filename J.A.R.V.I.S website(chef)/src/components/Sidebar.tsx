import { SignOutButton } from "../SignOutButton";

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ currentView, setCurrentView, isOpen, setIsOpen }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "chat", label: "Chat with JARVIS", icon: "💬" },
    { id: "todos", label: "Todo List", icon: "✅" },
    { id: "notes", label: "Sticky Notes", icon: "📝" },
    { id: "anime", label: "Anime Tracker", icon: "📺" },
    { id: "recipes", label: "Recipe Manager", icon: "🍳" },
    { id: "workouts", label: "Workout Tracker", icon: "💪" },
    { id: "habits", label: "Habit Tracker", icon: "🎯" },
    { id: "expenses", label: "Expense Tracker", icon: "💰" },
    { id: "games", label: "Game Generator", icon: "🎮" },
    { id: "images", label: "Image Generator", icon: "🎨" },
    { id: "code", label: "Code Assistant", icon: "💻" },
    { id: "calendar", label: "Calendar", icon: "📅" },
    { id: "analytics", label: "Analytics", icon: "📊" },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white/10 backdrop-blur-md border-r border-white/20 transition-all duration-300 z-50 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">J</span>
          </div>
          {isOpen && (
            <div>
              <h2 className="text-lg font-bold text-white">JARVIS</h2>
              <p className="text-xs text-gray-300">AI Assistant</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-500/30 text-white border border-blue-500/50'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
                title={!isOpen ? item.label : undefined}
              >
                <span className="text-lg">{item.icon}</span>
                {isOpen && <span className="font-medium">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/20">
        <div className={`${isOpen ? 'block' : 'flex justify-center'}`}>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
