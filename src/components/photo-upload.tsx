"use client";
import { useState, useRef } from "react";
import { Camera, X, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface CarAnalysis {
  make?: string;
  model?: string;
  year_estimate?: string;
  color?: string;
  body_type?: string;
  transmission?: string | null;
  fuel_type?: string | null;
  confidence?: string;
  dashboard_reading?: string | null;
  notes?: string;
}

interface PhotoUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  onAnalysis?: (analysis: CarAnalysis) => void;
  maxPhotos?: number;
}

export function PhotoUpload({ images, onChange, onAnalysis, maxPhotos = 20 }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CarAnalysis | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages: string[] = [];

    for (let i = 0; i < Math.min(files.length, maxPhotos - images.length); i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) continue;

      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from("car-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (!error) {
        const { data: urlData } = supabase.storage
          .from("car-images")
          .getPublicUrl(fileName);
        newImages.push(urlData.publicUrl);
      }
    }

    const allImages = [...images, ...newImages];
    onChange(allImages);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";

    // Auto-analyze all photos if it's the first upload
    if (images.length === 0 && newImages.length > 0 && onAnalysis) {
      analyzePhoto(newImages[0], allImages);
    }
  };

  const analyzePhoto = async (url: string, allUrls?: string[]) => {
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      // Send all images for comprehensive analysis
      const res = await fetch("/api/analyze-car", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrls: allUrls || [url] }),
      });
      if (res.ok) {
        const data: CarAnalysis = await res.json();
        setAnalysisResult(data);
        if (onAnalysis) onAnalysis(data);
      }
    } catch (err) {
      console.error("Analysis failed:", err);
    }
    setAnalyzing(false);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
          {images.map((url, i) => (
            <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted group">
              <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="150px" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1.5 right-1.5 bg-background/80 backdrop-blur rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* AI Analysis status */}
      {analyzing && (
        <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">🤖 AI is analyzing your car...</p>
            <p className="text-xs text-muted-foreground">Detecting make, model, color, and more</p>
          </div>
        </div>
      )}

      {analysisResult && !analyzing && (
        <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-foreground">AI Detection Complete</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              analysisResult.confidence === "high" ? "bg-green-900/30 text-green-400" :
              analysisResult.confidence === "medium" ? "bg-yellow-900/30 text-yellow-400" :
              "bg-red-900/30 text-red-400"
            }`}>
              {analysisResult.confidence} confidence
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {analysisResult.make && <div><span className="text-muted-foreground">Make:</span> <span className="text-foreground font-medium">{analysisResult.make}</span></div>}
            {analysisResult.model && <div><span className="text-muted-foreground">Model:</span> <span className="text-foreground font-medium">{analysisResult.model}</span></div>}
            {analysisResult.year_estimate && <div><span className="text-muted-foreground">Year:</span> <span className="text-foreground font-medium">{analysisResult.year_estimate}</span></div>}
            {analysisResult.color && <div><span className="text-muted-foreground">Color:</span> <span className="text-foreground font-medium">{analysisResult.color}</span></div>}
            {analysisResult.body_type && <div><span className="text-muted-foreground">Body:</span> <span className="text-foreground font-medium">{analysisResult.body_type}</span></div>}
            {analysisResult.transmission && <div><span className="text-muted-foreground">Transmission:</span> <span className="text-foreground font-medium">{analysisResult.transmission}</span></div>}
            {analysisResult.fuel_type && <div><span className="text-muted-foreground">Fuel:</span> <span className="text-foreground font-medium">{analysisResult.fuel_type}</span></div>}
            {analysisResult.dashboard_reading && <div className="col-span-2"><span className="text-muted-foreground">Odometer:</span> <span className="text-foreground font-medium">{analysisResult.dashboard_reading}</span></div>}
          </div>
          {analysisResult.notes && (
            <p className="text-xs text-muted-foreground mt-2 italic">{analysisResult.notes}</p>
          )}
          <p className="text-[10px] text-muted-foreground mt-2">✅ Form fields auto-filled. Review and adjust if needed.</p>
        </div>
      )}

      {/* Re-analyze button */}
      {images.length > 0 && !analyzing && onAnalysis && (
        <div className="mb-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => analyzePhoto(images[0], images)}
          >
            <Sparkles className="h-4 w-4" />
            {analysisResult ? "Re-analyze with AI" : "Analyze with AI"}
          </Button>
        </div>
      )}

      {/* Upload area */}
      {images.length < maxPhotos && (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer"
        >
          {uploading ? (
            <>
              <Loader2 className="h-10 w-10 mx-auto mb-3 text-primary animate-spin" />
              <p className="text-foreground font-medium">Uploading...</p>
            </>
          ) : (
            <>
              <Camera className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-foreground font-medium">
                {images.length === 0 ? "Click to upload photos" : "Add more photos"}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {images.length}/{maxPhotos} photos • Max 5MB each
              </p>
              {images.length === 0 && (
                <p className="text-primary text-xs mt-2 font-medium">🤖 AI will auto-detect your car details!</p>
              )}
            </>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}
