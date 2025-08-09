import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ChatInterface() {
  const [message, setMessage] = useState("");
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const messages = useQuery(api.jarvis.getChatHistory, { sessionId });
  const sendMessage = useMutation(api.jarvis.sendMessage);
  const generateResponse = useAction(api.jarvis.generateResponse);
  const clearHistory = useMutation(api.jarvis.clearChatHistory);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);

    try {
      // Send user message
      await sendMessage({ content: userMessage, sessionId });
      
      // Generate AI response
      await generateResponse({ content: userMessage, sessionId });
      
      toast.success("Message sent!");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await clearHistory({ sessionId });
      toast.success("Chat history cleared!");
    } catch (error) {
      console.error("Error clearing chat:", error);
      toast.error("Failed to clear chat");
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        toast.info("Listening...");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        toast.success("Voice input captured!");
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        toast.error("Voice input failed");
      };

      recognition.start();
    } else {
      toast.error("Voice input not supported in this browser");
    }
  };

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-md rounded-2xl border border-white/20">
      {/* Header */}
      <div className="p-4 border-b border-white/20 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">J</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">JARVIS</h2>
            <p className="text-sm text-gray-300">Your AI Assistant</p>
          </div>
        </div>
        
        <button
          onClick={handleClearChat}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 hover:text-red-200 transition-colors"
        >
          Clear Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-4">👋</div>
            <p className="text-lg">Hello! I'm JARVIS, your intelligent assistant.</p>
            <p className="text-sm mt-2">How may I assist you today?</p>
          </div>
        )}

        {messages?.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-gray-100 border border-white/20"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div className="text-xs opacity-70 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 border border-white/20 p-3 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/20">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleVoiceInput}
            className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 hover:text-purple-200 transition-colors"
            title="Voice Input"
          >
            🎤
          </button>
          
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask JARVIS anything..."
            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
          
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
