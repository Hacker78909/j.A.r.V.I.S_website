import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function RecipeManager() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    title: "",
    description: "",
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    difficulty: "easy" as "easy" | "medium" | "hard",
    cuisine: "american",
    dietaryTags: [] as string[],
    rating: 0,
    ingredients: [{ name: "", amount: "", unit: "cup" }],
    instructions: [""],
  });

  const recipes = useQuery(api.recipes.list, {});
  const createRecipe = useMutation(api.recipes.createRecipe);
  const deleteRecipe = useMutation(api.recipes.deleteRecipe);
  const recipeStats = useQuery(api.recipes.getStats);

  const cuisines = ["american", "italian", "mexican", "asian", "indian", "mediterranean", "french", "thai"];
  const dietaryOptions = ["vegetarian", "vegan", "gluten-free", "dairy-free", "keto", "low-carb", "high-protein"];
  const units = ["cup", "tbsp", "tsp", "oz", "lb", "g", "kg", "ml", "l", "piece", "clove"];

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipe.title.trim()) return;

    try {
      await createRecipe({
        title: newRecipe.title,
        description: newRecipe.description || undefined,
        ingredients: newRecipe.ingredients.filter(ing => ing.name.trim()),
        instructions: newRecipe.instructions.filter(inst => inst.trim()),
        prepTime: newRecipe.prepTime,
        cookTime: newRecipe.cookTime,
        servings: newRecipe.servings,
        difficulty: newRecipe.difficulty,
        cuisine: newRecipe.cuisine,
        dietaryTags: newRecipe.dietaryTags,
        rating: newRecipe.rating || undefined,
      });

      setNewRecipe({
        title: "",
        description: "",
        prepTime: 15,
        cookTime: 30,
        servings: 4,
        difficulty: "easy",
        cuisine: "american",
        dietaryTags: [],
        rating: 0,
        ingredients: [{ name: "", amount: "", unit: "cup" }],
        instructions: [""],
      });
      setShowAddForm(false);
      toast.success("Recipe saved!");
    } catch (error) {
      console.error("Error creating recipe:", error);
      toast.error("Failed to save recipe");
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      await deleteRecipe({ id: recipeId as any });
      toast.success("Recipe deleted!");
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast.error("Failed to delete recipe");
    }
  };

  const addIngredient = () => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", amount: "", unit: "cup" }]
    }));
  };

  const updateIngredient = (index: number, field: string, value: string) => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const removeIngredient = (index: number) => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const addInstruction = () => {
    setNewRecipe(prev => ({
      ...prev,
      instructions: [...prev.instructions, ""]
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setNewRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => 
        i === index ? value : inst
      )
    }));
  };

  const removeInstruction = (index: number) => {
    setNewRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const toggleDietaryTag = (tag: string) => {
    setNewRecipe(prev => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter(t => t !== tag)
        : [...prev.dietaryTags, tag]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">Total Recipes</h3>
          <div className="text-2xl font-bold text-orange-400">{recipeStats?.totalRecipes || 0}</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">Avg Rating</h3>
          <div className="text-2xl font-bold text-yellow-400">{recipeStats?.averageRating || 0}/5</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">Total Cook Time</h3>
          <div className="text-2xl font-bold text-green-400">{recipeStats?.totalCookTime || 0}min</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-medium transition-colors"
          >
            {showAddForm ? "Cancel" : "Add Recipe"}
          </button>
        </div>
      </div>

      {/* Add Recipe Form */}
      {showAddForm && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">🍳 Add New Recipe</h3>
          
          <form onSubmit={handleCreateRecipe} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Recipe Title</label>
                <input
                  type="text"
                  value={newRecipe.title}
                  onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Grandma's Chocolate Chip Cookies"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newRecipe.description}
                  onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Brief description of the recipe..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Prep Time (minutes)</label>
                <input
                  type="number"
                  value={newRecipe.prepTime}
                  onChange={(e) => setNewRecipe({ ...newRecipe, prepTime: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cook Time (minutes)</label>
                <input
                  type="number"
                  value={newRecipe.cookTime}
                  onChange={(e) => setNewRecipe({ ...newRecipe, cookTime: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Servings</label>
                <input
                  type="number"
                  value={newRecipe.servings}
                  onChange={(e) => setNewRecipe({ ...newRecipe, servings: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                <select
                  value={newRecipe.difficulty}
                  onChange={(e) => setNewRecipe({ ...newRecipe, difficulty: e.target.value as any })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cuisine</label>
                <select
                  value={newRecipe.cuisine}
                  onChange={(e) => setNewRecipe({ ...newRecipe, cuisine: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {cuisines.map(cuisine => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rating (1-5)</label>
                <input
                  type="number"
                  value={newRecipe.rating}
                  onChange={(e) => setNewRecipe({ ...newRecipe, rating: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  min="1"
                  max="5"
                />
              </div>
            </div>

            {/* Dietary Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Dietary Tags</label>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleDietaryTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      newRecipe.dietaryTags.includes(tag)
                        ? "bg-green-500/30 text-green-300 border border-green-500/50"
                        : "bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">Ingredients</label>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-green-300 text-sm transition-colors"
                >
                  Add Ingredient
                </button>
              </div>
              
              <div className="space-y-2">
                {newRecipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Ingredient name"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, "name", e.target.value)}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Amount"
                      value={ingredient.amount}
                      onChange={(e) => updateIngredient(index, "amount", e.target.value)}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                    <select
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-blue-500"
                    >
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">Instructions</label>
                <button
                  type="button"
                  onClick={addInstruction}
                  className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-green-300 text-sm transition-colors"
                >
                  Add Step
                </button>
              </div>
              
              <div className="space-y-2">
                {newRecipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="px-3 py-2 bg-blue-500/20 text-blue-300 rounded text-sm font-medium min-w-[40px] text-center">
                      {index + 1}
                    </span>
                    <textarea
                      placeholder="Describe this step..."
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                      rows={2}
                    />
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-medium transition-colors"
            >
              Save Recipe
            </button>
          </form>
        </div>
      )}

      {/* Recipe List */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">My Recipes</h3>
        
        {recipes && recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div key={recipe._id} className="p-4 rounded-lg border border-white/10 bg-white/5">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-white">{recipe.title}</h4>
                  <button
                    onClick={() => handleDeleteRecipe(recipe._id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 102 0v3a1 1 0 11-2 0V9zm4 0a1 1 0 10-2 0v3a1 1 0 102 0V9z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                {recipe.description && (
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">{recipe.description}</p>
                )}
                
                <div className="flex items-center space-x-4 mb-3 text-sm text-gray-300">
                  <span>⏱️ {recipe.prepTime + recipe.cookTime}min</span>
                  <span>👥 {recipe.servings}</span>
                  {recipe.rating && <span>⭐ {recipe.rating}/5</span>}
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    recipe.difficulty === "easy" ? "bg-green-500/20 text-green-300" :
                    recipe.difficulty === "medium" ? "bg-yellow-500/20 text-yellow-300" :
                    "bg-red-500/20 text-red-300"
                  }`}>
                    {recipe.difficulty}
                  </span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                    {recipe.cuisine}
                  </span>
                  {recipe.dietaryTags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <details className="text-sm">
                  <summary className="text-blue-400 cursor-pointer mb-2">View Recipe</summary>
                  <div className="space-y-2">
                    <div>
                      <h5 className="font-medium text-white">Ingredients:</h5>
                      <ul className="text-gray-300 text-xs">
                        {recipe.ingredients.map((ing, i) => (
                          <li key={i}>• {ing.amount} {ing.unit} {ing.name}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-white">Instructions:</h5>
                      <ol className="text-gray-300 text-xs">
                        {recipe.instructions.map((inst, i) => (
                          <li key={i}>{i + 1}. {inst}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </details>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🍳</div>
            <p className="text-gray-400">No recipes saved yet</p>
            <p className="text-sm text-gray-500 mt-1">Add your first recipe to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
