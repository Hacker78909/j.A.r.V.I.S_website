import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ChatInterface } from "./ChatInterface";
import { TodoList } from "./TodoList";
import { StickyNotes } from "./StickyNotes";
import { AnimeTracker } from "./AnimeTracker";
import { RecipeManager } from "./RecipeManager";
import { WorkoutTracker } from "./WorkoutTracker";
import { HabitTracker } from "./HabitTracker";
import { ExpenseTracker } from "./ExpenseTracker";
import { GameGenerator } from "./GameGenerator";
import { ImageGenerator } from "./ImageGenerator";
import { CodeAssistant } from "./CodeAssistant";
import { Calendar } from "./Calendar";
import { Analytics } from "./Analytics";

interface DashboardProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export function Dashboard({ currentView, setCurrentView }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = useQuery(api.auth.loggedInUser);

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardHome setCurrentView={setCurrentView} />;
      case "chat":
        return <ChatInterface />;
      case "todos":
        return <TodoList />;
      case "notes":
        return <StickyNotes />;
      case "anime":
        return <AnimeTracker />;
      case "recipes":
        return <RecipeManager />;
      case "workouts":
        return <WorkoutTracker />;
      case "habits":
        return <HabitTracker />;
      case "expenses":
        return <ExpenseTracker />;
      case "games":
        return <GameGenerator />;
      case "images":
        return <ImageGenerator />;
      case "code":
        return <CodeAssistant />;
      case "calendar":
        return <Calendar />;
      case "analytics":
        return user?.email === "creator@jarvis.dev" ? <Analytics /> : <div>Access Denied</div>;
      default:
        return <DashboardHome setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Header 
          currentView={currentView}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        <main className="flex-1 p-6 overflow-auto">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}

function DashboardHome({ setCurrentView }: { setCurrentView: (view: string) => void }) {
  const todoStats = useQuery(api.todos.getStats);
  const animeStats = useQuery(api.anime.getStats);
  const recipeStats = useQuery(api.recipes.getStats);
  const workoutStats = useQuery(api.workouts.getStats);
  const habitStats = useQuery(api.habits.getStats);
  const expenseStats = useQuery(api.expenses.getStats, {});

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to JARVIS</h1>
        <p className="text-gray-300">Your intelligent assistant is ready to help you be more productive.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">Tasks</h3>
          <div className="text-2xl font-bold text-blue-400">{todoStats?.pending || 0}</div>
          <p className="text-sm text-gray-300">Pending</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">Recipes</h3>
          <div className="text-2xl font-bold text-orange-400">{recipeStats?.totalRecipes || 0}</div>
          <p className="text-sm text-gray-300">Saved</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">Workouts</h3>
          <div className="text-2xl font-bold text-red-400">{workoutStats?.totalWorkouts || 0}</div>
          <p className="text-sm text-gray-300">Completed</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">Habits</h3>
          <div className="text-2xl font-bold text-green-400">{habitStats?.activeHabits || 0}</div>
          <p className="text-sm text-gray-300">Active</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">Expenses</h3>
          <div className="text-2xl font-bold text-purple-400">${expenseStats?.totalAmount || 0}</div>
          <p className="text-sm text-gray-300">This Month</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button 
            onClick={() => setCurrentView("chat")}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl p-4 text-center transition-colors"
          >
            <div className="text-2xl mb-2">💬</div>
            <div className="text-white font-medium">Chat with JARVIS</div>
          </button>
          
          <button 
            onClick={() => setCurrentView("recipes")}
            className="bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-xl p-4 text-center transition-colors"
          >
            <div className="text-2xl mb-2">🍳</div>
            <div className="text-white font-medium">Add Recipe</div>
          </button>
          
          <button 
            onClick={() => setCurrentView("workouts")}
            className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl p-4 text-center transition-colors"
          >
            <div className="text-2xl mb-2">💪</div>
            <div className="text-white font-medium">Log Workout</div>
          </button>
          
          <button 
            onClick={() => setCurrentView("habits")}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl p-4 text-center transition-colors"
          >
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-white font-medium">Track Habits</div>
          </button>

          <button 
            onClick={() => setCurrentView("expenses")}
            className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl p-4 text-center transition-colors"
          >
            <div className="text-2xl mb-2">💰</div>
            <div className="text-white font-medium">Add Expense</div>
          </button>
        </div>
      </div>

      {/* Live Clock */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <LiveClock />
      </div>
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-white mb-4">Current Time</h2>
      <div className="text-4xl font-mono font-bold text-blue-400 mb-2">
        {time.toLocaleTimeString()}
      </div>
      <div className="text-lg text-gray-300">
        {time.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>
    </div>
  );
}
