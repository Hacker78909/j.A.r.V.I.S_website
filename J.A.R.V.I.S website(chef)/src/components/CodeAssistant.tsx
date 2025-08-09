import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function CodeAssistant() {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("python");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState<string | null>(null);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<{ title: string; code: string } | null>(null);
  const [saveForm, setSaveForm] = useState({
    title: "",
    description: "",
    category: "utility",
    tags: [] as string[],
  });

  const snippets = useQuery(api.code.list, {});
  const generateCode = useAction(api.code.generateCode);
  const saveSnippet = useMutation(api.code.saveSnippet);
  const deleteSnippet = useMutation(api.code.deleteSnippet);
  const selectedSnippetData = useQuery(api.code.getSnippet, 
    selectedSnippet ? { id: selectedSnippet as any } : "skip"
  );

  const languages = [
    "python", "javascript", "typescript", "java", "cpp", "csharp", "go", "rust", "php", "ruby"
  ];

  const categories = [
    "utility", "algorithm", "data-structure", "web", "api", "database", "game", "ai-ml", "automation"
  ];

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const result = await generateCode({
        prompt,
        language,
        difficulty,
      });
      
      setGeneratedCode(result);
      setSaveForm(prev => ({ ...prev, title: result.title }));
      setShowSaveForm(true);
      toast.success("Code generated successfully!");
    } catch (error) {
      console.error("Error generating code:", error);
      toast.error("Failed to generate code");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSnippet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatedCode || !saveForm.title.trim()) return;

    try {
      await saveSnippet({
        title: saveForm.title,
        description: saveForm.description,
        language,
        code: generatedCode.code,
        tags: saveForm.tags,
        difficulty,
        category: saveForm.category,
      });
      
      toast.success("Code snippet saved!");
      setShowSaveForm(false);
      setGeneratedCode(null);
      setPrompt("");
      setSaveForm({
        title: "",
        description: "",
        category: "utility",
        tags: [],
      });
    } catch (error) {
      console.error("Error saving snippet:", error);
      toast.error("Failed to save snippet");
    }
  };

  const handleDeleteSnippet = async (snippetId: string) => {
    try {
      await deleteSnippet({ id: snippetId as any });
      toast.success("Snippet deleted!");
      if (selectedSnippet === snippetId) {
        setSelectedSnippet(null);
      }
    } catch (error) {
      console.error("Error deleting snippet:", error);
      toast.error("Failed to delete snippet");
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const addTag = (tag: string) => {
    if (tag && !saveForm.tags.includes(tag)) {
      setSaveForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSaveForm(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };

  return (
    <div className="space-y-6">
      {/* Code Generator */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">💻 AI Code Assistant</h2>
        <p className="text-gray-300 mb-6">
          Generate code snippets, get help with algorithms, and manage your code library with AI assistance.
        </p>
        
        <form onSubmit={handleGenerateCode} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What do you want to code?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to code... (e.g., 'A function to sort a list of dictionaries by a specific key' or 'A simple REST API endpoint')"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Programming Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Complexity Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
          >
            {isGenerating ? "Generating Code..." : "Generate Code"}
          </button>
        </form>
      </div>

      {/* Save Generated Code Form */}
      {showSaveForm && generatedCode && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Save Generated Code</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form onSubmit={handleSaveSnippet} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={saveForm.title}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={saveForm.description}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={saveForm.category}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {saveForm.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs flex items-center">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-300 hover:text-blue-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add tags (press Enter)"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag((e.target as HTMLInputElement).value.trim());
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors"
                >
                  Save Snippet
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaveForm(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-white">Generated Code</h4>
                <button
                  onClick={() => copyToClipboard(generatedCode.code)}
                  className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-green-300 text-sm transition-colors"
                >
                  Copy
                </button>
              </div>
              <div className="bg-black/30 rounded-lg p-4 max-h-64 overflow-auto">
                <pre className="text-sm text-green-400 whitespace-pre-wrap">
                  <code>{generatedCode.code}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Code Library */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Snippets List */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Code Library</h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {snippets?.map((snippet) => (
              <div
                key={snippet._id}
                className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                  selectedSnippet === snippet._id
                    ? "bg-blue-500/20 border-blue-500/50"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
                onClick={() => setSelectedSnippet(snippet._id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{snippet.title}</h4>
                    <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                      {snippet.description || "No description"}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                        {snippet.language}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        snippet.difficulty === "beginner" ? "bg-green-500/20 text-green-300" :
                        snippet.difficulty === "intermediate" ? "bg-yellow-500/20 text-yellow-300" :
                        "bg-red-500/20 text-red-300"
                      }`}>
                        {snippet.difficulty}
                      </span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                        {snippet.category}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSnippet(snippet._id);
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors ml-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 102 0v3a1 1 0 11-2 0V9zm4 0a1 1 0 10-2 0v3a1 1 0 102 0V9z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {snippets?.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">💻</div>
              <p className="text-gray-400">No code snippets yet</p>
              <p className="text-sm text-gray-500 mt-1">Generate your first snippet to get started!</p>
            </div>
          )}
        </div>

        {/* Code Viewer */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Code Snippet</h3>
            {selectedSnippetData && (
              <button
                onClick={() => copyToClipboard(selectedSnippetData.code)}
                className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-green-300 text-sm transition-colors"
              >
                Copy Code
              </button>
            )}
          </div>
          
          {selectedSnippetData ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">{selectedSnippetData.title}</h4>
                {selectedSnippetData.description && (
                  <p className="text-sm text-gray-300">{selectedSnippetData.description}</p>
                )}
                <div className="flex items-center space-x-2 mt-2">
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                    {selectedSnippetData.language}
                  </span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                    {selectedSnippetData.category}
                  </span>
                  {selectedSnippetData.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-black/30 rounded-lg p-4 max-h-96 overflow-auto">
                <pre className="text-sm text-green-400 whitespace-pre-wrap">
                  <code>{selectedSnippetData.code}</code>
                </pre>
              </div>
              
              <div className="text-xs text-gray-400">
                <p>Created: {new Date(selectedSnippetData.createdAt).toLocaleDateString()}</p>
                <p>Updated: {new Date(selectedSnippetData.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">👈</div>
              <p className="text-gray-400">Select a snippet to view its code</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
