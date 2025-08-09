import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function TodoList() {
  const [newTodo, setNewTodo] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<"low" | "medium" | "high">("medium");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const todos = useQuery(api.todos.list, {
    completed: filter === "all" ? undefined : filter === "completed",
  });
  const todoStats = useQuery(api.todos.getStats);
  const createTodo = useMutation(api.todos.create);
  const toggleTodo = useMutation(api.todos.toggle);
  const updateTodo = useMutation(api.todos.update);
  const deleteTodo = useMutation(api.todos.remove);

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      await createTodo({
        text: newTodo,
        priority: selectedPriority,
        category: selectedCategory || undefined,
        tags: [],
      });

      setNewTodo("");
      setSelectedCategory("");
      toast.success("Todo created!");
    } catch (error) {
      console.error("Error creating todo:", error);
      toast.error("Failed to create todo");
    }
  };

  const handleToggleTodo = async (todoId: string) => {
    try {
      await toggleTodo({ id: todoId as any });
      toast.success("Todo updated!");
    } catch (error) {
      console.error("Error toggling todo:", error);
      toast.error("Failed to update todo");
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      await deleteTodo({ id: todoId as any });
      toast.success("Todo deleted!");
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast.error("Failed to delete todo");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-400 border-red-400";
      case "medium": return "text-yellow-400 border-yellow-400";
      case "low": return "text-green-400 border-green-400";
      default: return "text-gray-400 border-gray-400";
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/20";
      case "medium": return "bg-yellow-500/20";
      case "low": return "bg-green-500/20";
      default: return "bg-gray-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-sm font-medium text-gray-300">Total</h3>
          <div className="text-2xl font-bold text-white">{todoStats?.total || 0}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-sm font-medium text-gray-300">Pending</h3>
          <div className="text-2xl font-bold text-yellow-400">{todoStats?.pending || 0}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-sm font-medium text-gray-300">Completed</h3>
          <div className="text-2xl font-bold text-green-400">{todoStats?.completed || 0}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-sm font-medium text-gray-300">Overdue</h3>
          <div className="text-2xl font-bold text-red-400">{todoStats?.overdue || 0}</div>
        </div>
      </div>

      {/* Create Todo Form */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">Add New Todo</h2>
        
        <form onSubmit={handleCreateTodo} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Task Description
            </label>
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as any)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category (Optional)
              </label>
              <input
                type="text"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                placeholder="e.g., Work, Personal, Shopping"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!newTodo.trim()}
            className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
          >
            Add Todo
          </button>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-white/10 backdrop-blur-md rounded-lg p-1 border border-white/20">
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "completed", label: "Completed" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              filter === tab.key
                ? "bg-blue-500 text-white"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Todo List */}
      <div className="space-y-3">
        {todos?.map((todo) => (
          <div
            key={todo._id}
            className={`bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 transition-all ${
              todo.completed ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-start space-x-3">
              <button
                onClick={() => handleToggleTodo(todo._id)}
                className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  todo.completed
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-gray-400 hover:border-green-400"
                }`}
              >
                {todo.completed && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-white font-medium ${todo.completed ? "line-through" : ""}`}>
                    {todo.text}
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(todo.priority)} ${getPriorityBg(todo.priority)}`}>
                      {todo.priority}
                    </span>
                    
                    <button
                      onClick={() => handleDeleteTodo(todo._id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 102 0v3a1 1 0 11-2 0V9zm4 0a1 1 0 10-2 0v3a1 1 0 102 0V9z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                  {todo.category && (
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs">
                      {todo.category}
                    </span>
                  )}
                  <span>
                    Created {new Date(todo.createdAt).toLocaleDateString()}
                  </span>
                  {todo.completedAt && (
                    <span>
                      Completed {new Date(todo.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {todos?.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {filter === "all" ? "No todos yet" : `No ${filter} todos`}
          </h3>
          <p className="text-gray-400">
            {filter === "all" 
              ? "Create your first todo to get started!" 
              : `You have no ${filter} todos at the moment.`
            }
          </p>
        </div>
      )}
    </div>
  );
}
