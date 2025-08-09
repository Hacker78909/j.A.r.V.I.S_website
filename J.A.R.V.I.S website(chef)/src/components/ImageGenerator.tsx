import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [dimensions, setDimensions] = useState({ width: 512, height: 512 });
  const [isGenerating, setIsGenerating] = useState(false);

  const images = useQuery(api.images.list, {});
  const generateImage = useAction(api.images.generateImage);
  const deleteImage = useMutation(api.images.deleteImage);

  const styles = [
    "realistic", "artistic", "cartoon", "anime", "abstract", "vintage", "modern", "fantasy"
  ];

  const dimensionPresets = [
    { label: "Square (512x512)", width: 512, height: 512 },
    { label: "Portrait (512x768)", width: 512, height: 768 },
    { label: "Landscape (768x512)", width: 768, height: 512 },
    { label: "Wide (1024x512)", width: 1024, height: 512 },
  ];

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      await generateImage({
        prompt,
        style,
        dimensions,
      });
      
      toast.success("Image generated successfully!");
      setPrompt("");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteImage({ id: imageId as any });
      toast.success("Image deleted!");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  return (
    <div className="space-y-6">
      {/* Generator Form */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">🎨 AI Image Generator</h2>
        <p className="text-gray-300 mb-6">
          Create stunning images with AI. Describe what you want to see and I'll generate it for you!
        </p>
        
        <form onSubmit={handleGenerateImage} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Image Description
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create... (e.g., 'A serene mountain landscape at sunset' or 'A futuristic city with flying cars')"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Art Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {styles.map(styleOption => (
                  <option key={styleOption} value={styleOption}>
                    {styleOption.charAt(0).toUpperCase() + styleOption.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dimensions
              </label>
              <select
                value={`${dimensions.width}x${dimensions.height}`}
                onChange={(e) => {
                  const preset = dimensionPresets.find(p => `${p.width}x${p.height}` === e.target.value);
                  if (preset) {
                    setDimensions({ width: preset.width, height: preset.height });
                  }
                }}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {dimensionPresets.map(preset => (
                  <option key={`${preset.width}x${preset.height}`} value={`${preset.width}x${preset.height}`}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
          >
            {isGenerating ? "Generating Image..." : "Generate Image"}
          </button>
        </form>
      </div>

      {/* Generated Images Gallery */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Your Generated Images</h3>
        
        {images && images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div key={image._id} className="bg-white/5 rounded-lg overflow-hidden border border-white/10">
                <div className="aspect-square bg-gray-800 flex items-center justify-center">
                  <img
                    src={image.imageUrl}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://via.placeholder.com/${image.dimensions.width}x${image.dimensions.height}/6366f1/ffffff?text=Generated+Image`;
                    }}
                  />
                </div>
                
                <div className="p-4">
                  <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                    {image.prompt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                        {image.style}
                      </span>
                      <span className="text-xs text-gray-400">
                        {image.dimensions.width}×{image.dimensions.height}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteImage(image._id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 102 0v3a1 1 0 11-2 0V9zm4 0a1 1 0 10-2 0v3a1 1 0 102 0V9z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-400">
                      Generated {new Date(image.createdAt).toLocaleDateString()}
                    </p>
                    {image.enhancedPrompt !== image.prompt && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-400 cursor-pointer">Enhanced Prompt</summary>
                        <p className="text-xs text-gray-400 mt-1">{image.enhancedPrompt}</p>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-white mb-2">No images generated yet</h3>
            <p className="text-gray-400">Create your first AI-generated image to get started!</p>
          </div>
        )}
      </div>

      {/* Note about demo */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-yellow-400 text-xl">💡</div>
          <div>
            <h4 className="text-yellow-300 font-medium">Demo Mode</h4>
            <p className="text-yellow-200/80 text-sm mt-1">
              This is a demo version using placeholder images. In a full implementation, 
              this would connect to DALL-E or another image generation API to create real AI images.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
