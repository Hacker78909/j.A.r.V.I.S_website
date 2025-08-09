import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function HabitTracker() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: "",
    description: "",
    frequency: "daily" as "daily" | "weekly" | "monthly",
    target: 1,
    unit: "times",
    category: "health",
    color: "#3b82f6",
  });

  const habits = useQuery(api.habits.list, {});
  const createHabit = useMutation(api.habits.createHabit);
  const logCompletion = useMutation(api.habits.logCompletion);
  const deleteHabit = useMutation(api.habits.deleteHabit);
  const habitStats = useQuery(api.habits.getStats);

  const categories = [
    { value: "health", label: "Health", color: "#10b981" },
    { value: "fitness", label: "Fitness", color: "#ef4444" },
    { value: "productivity", label: "Productivity", color: "#3b82f6" },
    { value: "learning", label: "Learning", color: "#8b5cf6" },
    { value: "mindfulness", label: "Mindfulness", color: "#f59e0b" },
    { value: "social", label: "Social", color: "#ec4899" },
  ];

  const units = ["times", "minutes", "hours", "pages", "glasses", "steps", "km", "miles"];

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.name.trim()) return;

    try {
      await createHabit({
        name: newHabit.name,
        description: newHabit.description || undefined,
        frequency: newHabit.frequency,
        target: newHabit.target,
        unit: newHabit.unit,
        category: newHabit.category,
        color: newHabit.color,
      });

      setNewHabit({
        name: "",
        description: "",
        frequency: "daily",
        target: 1,
        unit: "times",
        category: "health",
        color: "#3b82f6",
      });
      setShowAddForm(false);
      toast.success("Habit created!");
    } catch (error) {
      console.error("Error creating habit:", error);
      toast.error("Failed to create habit");
    }
  };

  const handleLogCompletion = async (habitId: string, value: number) => {
    try {
      await logCompletion({
        habitId: habitId as any,
        value,
        notes: undefined,
      });
      toast.success("Progress logged!");
    } catch (error) {
      console.error("Error logging completion:", error);
      toast.error("Failed to log progress");
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await deleteHabit({ id: habitId as any });
      toast.success("Habit deleted!");
    } catch (error) {
      console.error("Error deleting habit:", error);
      toast.error("Failed to delete habit");
    }
  };

  const getCategoryColor = (category: string) => {
    return categories.find(c => c.value === category)?.color || "#6b7280";
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">Total Habits</h3>
          <div className="text-2xl font-bold text-blue-400">{habitStats?.totalHabits || 0}</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">Active Habits</h3>
          <div className="text-2xl font-bold text-green-400">{habitStats?.activeHabits || 0}</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">Best Streak</h3>
          <div className="text-2xl font-bold text-yellow-400">{habitStats?.bestStreak || 0}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium transition-colors"
          >
            {showAddForm ? "Cancel" : "Add Habit"}
          </button>
        </div>
      </div>

      {/* Add Habit Form */}
      {showAddForm && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">🎯 Create New Habit</h3>
          
          <form onSubmit={handleCreateHabit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Habit Name</label>
                <input
                  type="text"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Drink water, Exercise, Read"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={newHabit.category}
                  onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value, color: getCategoryColor(e.target.value) })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
                <select
                  value={newHabit.frequency}
                  onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value as any })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={newHabit.target}
                    onChange={(e) => setNewHabit({ ...newHabit, target: parseInt(e.target.value) || 1 })}
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    min="1"
                    required
                  />
                  <select
                    value={newHabit.unit}
                    onChange={(e) => setNewHabit({ ...newHabit, unit: e.target.value })}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={newHabit.description}
                onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Why is this habit important to you?"
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium transition-colors"
            >
              Create Habit
            </button>
          </form>
        </div>
      )}

      {/* Habits List */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">My Habits</h3>
        
        {habits && habits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map((habit) => (
              <div key={habit._id} className="p-4 rounded-lg border border-white/10 bg-white/5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: habit.color }}
                    ></div>
                    <h4 className="font-semibold text-white">{habit.name}</h4>
                  </div>
                  <button
                    onClick={() => handleDeleteHabit(habit._id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 102 0v3a1 1 0 11-2 0V9zm4 0a1 1 0 10-2 0v3a1 1 0 102 0V9z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                {habit.description && (
                  <p className="text-sm text-gray-300 mb-3">{habit.description}</p>
                )}
                
                <div className="flex items-center justify-between mb-3 text-sm text-gray-300">
                  <span>🎯 {habit.target} {habit.unit} {habit.frequency}</span>
                  <span>🔥 {habit.streak} streak</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleLogCompletion(habit._id, habit.target)}
                    className="flex-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-green-300 text-sm transition-colors"
                  >
                    Complete Today
                  </button>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    habit.isActive 
                      ? "bg-green-500/20 text-green-300" 
                      : "bg-gray-500/20 text-gray-300"
                  }`}>
                    {habit.isActive ? "Active" : "Paused"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-gray-400">No habits created yet</p>
            <p className="text-sm text-gray-500 mt-1">Start building positive habits!</p>
          </div>
        )}
      </div>
    </div>
  );
}
