import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ExpenseTracker() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: 0,
    category: "food",
    subcategory: "",
    description: "",
    date: Date.now(),
    paymentMethod: "cash",
    tags: [] as string[],
    isRecurring: false,
  });

  const expenses = useQuery(api.expenses.list, {});
  const createExpense = useMutation(api.expenses.createExpense);
  const deleteExpense = useMutation(api.expenses.deleteExpense);
  const expenseStats = useQuery(api.expenses.getStats, {});

  const categories = [
    { value: "food", label: "Food & Dining", color: "#f59e0b" },
    { value: "transportation", label: "Transportation", color: "#3b82f6" },
    { value: "shopping", label: "Shopping", color: "#ec4899" },
    { value: "entertainment", label: "Entertainment", color: "#8b5cf6" },
    { value: "bills", label: "Bills & Utilities", color: "#ef4444" },
    { value: "healthcare", label: "Healthcare", color: "#10b981" },
    { value: "education", label: "Education", color: "#f97316" },
    { value: "travel", label: "Travel", color: "#06b6d4" },
    { value: "other", label: "Other", color: "#6b7280" },
  ];

  const paymentMethods = ["cash", "credit-card", "debit-card", "bank-transfer", "digital-wallet"];
  const commonTags = ["work", "personal", "family", "urgent", "planned", "unexpected"];

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpense.amount <= 0) return;

    try {
      await createExpense({
        amount: newExpense.amount,
        category: newExpense.category,
        subcategory: newExpense.subcategory || undefined,
        description: newExpense.description,
        date: newExpense.date,
        paymentMethod: newExpense.paymentMethod,
        tags: newExpense.tags,
        isRecurring: newExpense.isRecurring,
      });

      setNewExpense({
        amount: 0,
        category: "food",
        subcategory: "",
        description: "",
        date: Date.now(),
        paymentMethod: "cash",
        tags: [],
        isRecurring: false,
      });
      setShowAddForm(false);
      toast.success("Expense added!");
    } catch (error) {
      console.error("Error creating expense:", error);
      toast.error("Failed to add expense");
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense({ id: expenseId as any });
      toast.success("Expense deleted!");
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    }
  };

  const toggleTag = (tag: string) => {
    setNewExpense(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const getCategoryColor = (category: string) => {
    return categories.find(c => c.value === category)?.color || "#6b7280";
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">Total Expenses</h3>
          <div className="text-2xl font-bold text-red-400">{expenseStats?.totalExpenses || 0}</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">Total Amount</h3>
          <div className="text-2xl font-bold text-green-400">${expenseStats?.totalAmount || 0}</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">Average</h3>
          <div className="text-2xl font-bold text-blue-400">${expenseStats?.averageExpense || 0}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium transition-colors"
          >
            {showAddForm ? "Cancel" : "Add Expense"}
          </button>
        </div>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">💰 Add New Expense</h3>
          
          <form onSubmit={handleCreateExpense} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Subcategory</label>
                <input
                  type="text"
                  value={newExpense.subcategory}
                  onChange={(e) => setNewExpense({ ...newExpense, subcategory: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Groceries, Gas, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
                <select
                  value={newExpense.paymentMethod}
                  onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>
                      {method.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                <input
                  type="date"
                  value={new Date(newExpense.date).toISOString().split('T')[0]}
                  onChange={(e) => setNewExpense({ ...newExpense, date: new Date(e.target.value).getTime() })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={newExpense.isRecurring}
                  onChange={(e) => setNewExpense({ ...newExpense, isRecurring: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="recurring" className="text-sm text-gray-300">Recurring expense</label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <input
                type="text"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="What was this expense for?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {commonTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      newExpense.tags.includes(tag)
                        ? "bg-blue-500/30 text-blue-300 border border-blue-500/50"
                        : "bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium transition-colors"
            >
              Add Expense
            </button>
          </form>
        </div>
      )}

      {/* Expense List */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Recent Expenses</h3>
        
        {expenses && expenses.length > 0 ? (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense._id} className="p-4 rounded-lg border border-white/10 bg-white/5">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getCategoryColor(expense.category) }}
                      ></div>
                      <h4 className="font-semibold text-white">{expense.description}</h4>
                      <span className="text-2xl font-bold text-red-400">${expense.amount}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <span>📂 {categories.find(c => c.value === expense.category)?.label}</span>
                      {expense.subcategory && <span>📁 {expense.subcategory}</span>}
                      <span>💳 {expense.paymentMethod.replace('-', ' ')}</span>
                      {expense.isRecurring && <span>🔄 Recurring</span>}
                    </div>
                    
                    {expense.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {expense.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteExpense(expense._id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 102 0v3a1 1 0 11-2 0V9zm4 0a1 1 0 10-2 0v3a1 1 0 102 0V9z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">💰</div>
            <p className="text-gray-400">No expenses tracked yet</p>
            <p className="text-sm text-gray-500 mt-1">Start tracking your spending!</p>
          </div>
        )}
      </div>
    </div>
  );
}
