"use client";
import { useState, useRef } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

interface PhotoUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxPhotos?: number;
}

export function PhotoUpload({ images, onChange, maxPhotos = 20 }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages: string[] = [];

    for (let i = 0; i < Math.min(files.length, maxPhotos - images.length); i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) continue; // Skip files > 5MB

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

    onChange([...images, ...newImages]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
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
                {images.length}/{maxPhotos} photos • Max 5MB each • JPG, PNG, WebP
              </p>
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
