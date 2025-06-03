import { useState } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";

export function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Id<"generatedImages"> | null>(null);
  const generateImage = useAction(api.creator.generateImage);
  const deleteImage = useMutation(api.creator.deleteImage);
  const images = useQuery(api.creator.listImages) || [];

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
      setPrompt(transcript);
    };

    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    try {
      await generateImage({ prompt });
      setPrompt("");
      toast.success("Image generated successfully!");
    } catch (error) {
      toast.error("Failed to generate image");
    }
  };

  const handleDelete = async (id: Id<"generatedImages">) => {
    try {
      await deleteImage({ id });
      if (selectedImage === id) {
        setSelectedImage(null);
      }
      toast.success("Image deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${prompt.slice(0, 30).replace(/[^a-z0-9]/gi, "_")}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700/50 shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">AI Image Generator</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                className="w-full p-4 bg-gray-900/50 rounded-xl border border-gray-700/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 h-32 placeholder-gray-500"
              />
              <div className="absolute bottom-3 right-3 text-gray-500 text-sm">
                {prompt.length}/1000
              </div>
            </div>
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-4 rounded-xl transition-all duration-200 ${
                isListening 
                  ? "bg-red-500/20 border-red-500/50 text-red-400" 
                  : "bg-blue-500/20 border-blue-500/50 text-blue-400"
              } border hover:bg-opacity-30`}
            >
              {isListening ? "Listening..." : "🎤"}
            </button>
          </div>
          <button
            type="submit"
            disabled={!prompt.trim()}
            className="w-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Image
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Generated Images
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {images.map((image) => (
            <div
              key={image._id}
              className="group bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50 overflow-hidden transition-all duration-200 hover:border-blue-500/50 hover:shadow-2xl"
            >
              <div className="p-4 border-b border-gray-700/50">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-200 line-clamp-2">{image.prompt}</h3>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">Enhanced: {image.enhancedPrompt}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(image.imageUrl, image.prompt)}
                      className="p-2 bg-blue-500/20 border border-blue-500/50 rounded-lg hover:bg-blue-500/30 transition-colors"
                      title="Download"
                    >
                      💾
                    </button>
                    <button
                      onClick={() => handleDelete(image._id)}
                      className="p-2 bg-red-500/20 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Created: {new Date(image.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="relative aspect-video bg-gray-900/50 overflow-hidden group-hover:brightness-110 transition-all duration-200">
                <img
                  src={image.imageUrl}
                  alt={image.prompt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
