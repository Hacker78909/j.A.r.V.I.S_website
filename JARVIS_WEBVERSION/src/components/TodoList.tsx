import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function TodoList() {
  const todos = useQuery(api.todos.list) || [];
  const createTodo = useMutation(api.todos.create);
  const toggleTodo = useMutation(api.todos.toggle);
  const [newTodo, setNewTodo] = useState("");

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Tasks</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createTodo({ text: newTodo });
          setNewTodo("");
        }}
        className="mb-4"
      >
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
          placeholder="Add new task..."
        />
      </form>
      <ul className="space-y-2">
        {todos.map((todo) => (
          <li
            key={todo._id}
            className="flex items-center gap-2 p-2 bg-gray-700 rounded"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo({ id: todo._id })}
            />
            <span className={todo.completed ? "line-through" : ""}>
              {todo.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
