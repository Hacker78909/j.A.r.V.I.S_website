import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function WorkoutTracker() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    name: "",
    type: "strength",
    duration: 30,
    calories: 0,
    difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
    equipment: [] as string[],
    bodyParts: [] as string[],
    rating: 0,
    notes: "",
    exercises: [{ name: "", sets: 0, reps: 0, weight: 0, notes: "" }],
  });

  const workouts = useQuery(api.workouts.list, {});
  const createWorkout = useMutation(api.workouts.createWorkout);
  const deleteWorkout = useMutation(api.workouts.deleteWorkout);
  const workoutStats = useQuery(api.workouts.getStats);

  const workoutTypes = ["strength", "cardio", "flexibility", "sports", "yoga", "pilates"];
  const equipmentOptions = ["dumbbells", "barbell", "resistance-bands", "bodyweight", "treadmill", "bike"];
  const bodyPartOptions = ["chest", "back", "shoulders", "arms", "legs", "core", "full-body"];

  const handleCreateWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkout.name.trim()) return;

    try {
      await createWorkout({
        name: newWorkout.name,
        type: newWorkout.type,
        exercises: newWorkout.exercises.filter(ex => ex.name.trim()),
        duration: newWorkout.duration,
        calories: newWorkout.calories || undefined,
        difficulty: newWorkout.difficulty,
        equipment: newWorkout.equipment,
        bodyParts: newWorkout.bodyParts,
        rating: newWorkout.rating || undefined,
        notes: newWorkout.notes || undefined,
      });

      setNewWorkout({
        name: "",
        type: "strength",
        duration: 30,
        calories: 0,
        difficulty: "beginner",
        equipment: [],
        bodyParts: [],
        rating: 0,
        notes: "",
        exercises: [{ name: "", sets: 0, reps: 0, weight: 0, notes: "" }],
      });
      setShowAddForm(false);
      toast.success("Workout logged!");
    } catch (error) {
      console.error("Error creating workout:", error);
      toast.error("Failed to log workout");
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      await deleteWorkout({ id: workoutId as any });
      toast.success("Workout deleted!");
    } catch (error) {
      console.error("Error deleting workout:", error);
      toast.error("Failed to delete workout");
    }
  };

  const addExercise = () => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, { name: "", sets: 0, reps: 0, weight: 0, notes: "" }]
    }));
  };

  const updateExercise = (index: number, field: string, value: any) => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => 
        i === index ? { ...ex, [field]: value } : ex
      )
    }));
  };

  const removeExercise = (index: number) => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const toggleArrayItem = (array: string[], item: string, setter: (items: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">Total Workouts</h3>
          <div className="text-2xl font-bold text-blue-400">{workoutStats?.totalWorkouts || 0}</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">Calories Burned</h3>
          <div className="text-2xl font-bold text-red-400">{workoutStats?.totalCalories || 0}</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">Avg Rating</h3>
          <div className="text-2xl font-bold text-yellow-400">{workoutStats?.averageRating || 0}/5</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors"
          >
            {showAddForm ? "Cancel" : "Log Workout"}
          </button>
        </div>
      </div>

      {/* Add Workout Form */}
      {showAddForm && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">💪 Log New Workout</h3>
          
          <form onSubmit={handleCreateWorkout} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Workout Name</label>
                <input
                  type="text"
                  value={newWorkout.name}
                  onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Morning Strength Training"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <select
                  value={newWorkout.type}
                  onChange={(e) => setNewWorkout({ ...newWorkout, type: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {workoutTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={newWorkout.duration}
                  onChange={(e) => setNewWorkout({ ...newWorkout, duration: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Calories Burned</label>
                <input
                  type="number"
                  value={newWorkout.calories}
                  onChange={(e) => setNewWorkout({ ...newWorkout, calories: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                <select
                  value={newWorkout.difficulty}
                  onChange={(e) => setNewWorkout({ ...newWorkout, difficulty: e.target.value as any })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rating (1-5)</label>
                <input
                  type="number"
                  value={newWorkout.rating}
                  onChange={(e) => setNewWorkout({ ...newWorkout, rating: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  min="1"
                  max="5"
                />
              </div>
            </div>

            {/* Equipment */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Equipment Used</label>
              <div className="flex flex-wrap gap-2">
                {equipmentOptions.map(equipment => (
                  <button
                    key={equipment}
                    type="button"
                    onClick={() => toggleArrayItem(
                      newWorkout.equipment, 
                      equipment, 
                      (items) => setNewWorkout({ ...newWorkout, equipment: items })
                    )}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      newWorkout.equipment.includes(equipment)
                        ? "bg-blue-500/30 text-blue-300 border border-blue-500/50"
                        : "bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20"
                    }`}
                  >
                    {equipment.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Body Parts */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Body Parts Targeted</label>
              <div className="flex flex-wrap gap-2">
                {bodyPartOptions.map(part => (
                  <button
                    key={part}
                    type="button"
                    onClick={() => toggleArrayItem(
                      newWorkout.bodyParts, 
                      part, 
                      (items) => setNewWorkout({ ...newWorkout, bodyParts: items })
                    )}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      newWorkout.bodyParts.includes(part)
                        ? "bg-green-500/30 text-green-300 border border-green-500/50"
                        : "bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20"
                    }`}
                  >
                    {part}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercises */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">Exercises</label>
                <button
                  type="button"
                  onClick={addExercise}
                  className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-green-300 text-sm transition-colors"
                >
                  Add Exercise
                </button>
              </div>
              
              <div className="space-y-3">
                {newWorkout.exercises.map((exercise, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 bg-white/5 rounded-lg">
                    <input
                      type="text"
                      placeholder="Exercise name"
                      value={exercise.name}
                      onChange={(e) => updateExercise(index, "name", e.target.value)}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Sets"
                      value={exercise.sets}
                      onChange={(e) => updateExercise(index, "sets", parseInt(e.target.value) || 0)}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Reps"
                      value={exercise.reps}
                      onChange={(e) => updateExercise(index, "reps", parseInt(e.target.value) || 0)}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Weight (lbs)"
                      value={exercise.weight}
                      onChange={(e) => updateExercise(index, "weight", parseInt(e.target.value) || 0)}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeExercise(index)}
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
              <textarea
                value={newWorkout.notes}
                onChange={(e) => setNewWorkout({ ...newWorkout, notes: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="How did the workout feel? Any observations?"
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors"
            >
              Log Workout
            </button>
          </form>
        </div>
      )}

      {/* Workout History */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Workout History</h3>
        
        {workouts && workouts.length > 0 ? (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <div key={workout._id} className="p-4 rounded-lg border border-white/10 bg-white/5">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{workout.name}</h4>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-300">
                      <span>🏃 {workout.type}</span>
                      <span>⏱️ {workout.duration}min</span>
                      {workout.calories && <span>🔥 {workout.calories} cal</span>}
                      {workout.rating && <span>⭐ {workout.rating}/5</span>}
                    </div>
                    
                    {workout.exercises.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-400">Exercises:</p>
                        <div className="text-sm text-gray-300">
                          {workout.exercises.map((ex, i) => (
                            <span key={i}>
                              {ex.name}
                              {ex.sets && ex.reps && ` (${ex.sets}x${ex.reps})`}
                              {ex.weight && ` @ ${ex.weight}lbs`}
                              {i < workout.exercises.length - 1 && ", "}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {workout.bodyParts.map(part => (
                        <span key={part} className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                          {part}
                        </span>
                      ))}
                    </div>
                    
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(workout.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteWorkout(workout._id)}
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
            <div className="text-4xl mb-4">💪</div>
            <p className="text-gray-400">No workouts logged yet</p>
            <p className="text-sm text-gray-500 mt-1">Start tracking your fitness journey!</p>
          </div>
        )}
      </div>
    </div>
  );
}
