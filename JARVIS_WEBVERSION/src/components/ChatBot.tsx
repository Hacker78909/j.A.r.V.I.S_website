import { useState, useRef, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

export function ChatBot() {
  const messages = useQuery(api.chat.list) || [];
  const sendMessage = useAction(api.chat.send);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userInput = input;
    setInput("");
    setIsTyping(true);

    try {
      await sendMessage({ content: userInput });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const markdownComponents: Components = {
    p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
    ul: ({children}) => <ul className="mb-2 list-disc list-inside">{children}</ul>,
    li: ({children}) => <li className="mb-1">{children}</li>,
    code: ({node, children, ...props}) => {
      // @ts-ignore - inline prop exists but types are incorrect
      const isInline = props.inline;
      return isInline ? 
        <code className="px-1 py-0.5 bg-gray-800 rounded text-sm">{children}</code> : 
        <code>{children}</code>;
    },
    blockquote: ({children}) => 
      <blockquote className="border-l-2 border-blue-500 pl-2 my-2 italic text-gray-300">{children}</blockquote>,
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-gray-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h2 className="text-xl font-semibold text-blue-400">J.A.R.V.I.S</h2>
        </div>
        <p className="text-sm text-gray-400 mt-1">Just A Rather Very Intelligent System</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8 space-y-4">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-600/20 flex items-center justify-center">
              <span className="text-4xl">🤖</span>
            </div>
            <p className="text-2xl font-semibold text-blue-400">Welcome, I am JARVIS</p>
            <p className="text-lg text-gray-400">How may I assist you today?</p>
            <div className="max-w-md mx-auto mt-8 text-left space-y-2">
              <p className="text-sm text-gray-500">Try asking me about:</p>
              <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                <li>Creating a Python game</li>
                <li>Generating images</li>
                <li>Tracking your anime watchlist</li>
                <li>Managing tasks and notes</li>
                <li>Getting help with code</li>
              </ul>
            </div>
          </div>
        )}
        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center mr-2">
                🤖
              </div>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-700 text-white rounded-bl-none"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown components={markdownComponents}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                message.content
              )}
            </div>
            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center ml-2">
                👤
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center mr-2">
              🤖
            </div>
            <div className="bg-gray-700 text-white p-3 rounded-lg rounded-bl-none">
              <div className="flex gap-2">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-gray-700 bg-gray-800"
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask me anything..."
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
