import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";

export function CodeBuddy() {
  const [code, setCode] = useState("");
  const [request, setRequest] = useState("");
  const [response, setResponse] = useState("");
  const [isListening, setIsListening] = useState(false);
  const getHelp = useAction(api.creator.getCodeHelp);

  const handleVoiceInput = () => {
    if (!window.webkitSpeechRecognition) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setRequest(transcript);
    };

    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !request.trim()) return;

    try {
      const result = await getHelp({ code, request });
      if (result) {
        setResponse(result);
      }
    } catch (error) {
      toast.error("Failed to get code help");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Code Assistant</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Your Code</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="w-full p-2 bg-gray-700 rounded h-48 font-mono"
            />
          </div>
          <div className="flex gap-2">
            <textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder="What would you like help with? (e.g., 'Explain this code', 'Fix the bug', 'Optimize this')"
              className="flex-1 p-2 bg-gray-700 rounded h-32"
            />
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-2 rounded ${
                isListening ? "bg-red-600" : "bg-blue-600"
              }`}
            >
              {isListening ? "Listening..." : "🎤"}
            </button>
          </div>
          <button
            type="submit"
            className="w-full p-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Get Help
          </button>
        </form>
      </div>

      {response && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Response</h3>
          <div className="bg-gray-900 p-4 rounded whitespace-pre-wrap">
            {response}
          </div>
        </div>
      )}
    </div>
  );
}
