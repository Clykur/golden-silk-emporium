import { useCallback, useRef, useState } from "react";
import { Upload, X, Star, GripVertical } from "lucide-react";
import { uploadProductImage } from "@/lib/storage";

interface ImageItem {
  url: string;
  alt_text: string;
  is_featured: boolean;
  sort_order: number;
  uploading?: boolean;
  file?: File;
  preview?: string;
}

interface ImageUploaderProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  productId?: string;
  maxImages?: number;
}

export function ImageUploader({ images, onChange, productId = "temp", maxImages = 10 }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setError("");

      const remaining = maxImages - images.length;
      if (remaining <= 0) {
        setError(`Maximum ${maxImages} images allowed`);
        return;
      }

      const selected = Array.from(files).slice(0, remaining);
      const invalid = selected.filter((f) => !f.type.startsWith("image/"));
      if (invalid.length > 0) {
        setError("Only image files are allowed");
        return;
      }

      // Add placeholders with previews
      const previews: ImageItem[] = selected.map((file, i) => ({
        url: "",
        alt_text: file.name.replace(/\.[^/.]+$/, ""),
        is_featured: images.length === 0 && i === 0,
        sort_order: images.length + i,
        uploading: true,
        file,
        preview: URL.createObjectURL(file),
      }));

      onChange([...images, ...previews]);

      // Upload each file
      const uploaded = await Promise.all(
        selected.map(async (file, i) => {
          try {
            const url = await uploadProductImage(file, productId);
            return { ...previews[i], url, uploading: false, file: undefined };
          } catch {
            return null;
          }
        })
      );

      // Update with real URLs
      onChange([
        ...images,
        ...uploaded.filter(Boolean).map((img) => img!),
      ]);
    },
    [images, onChange, productId, maxImages]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index).map((img, i) => ({
      ...img,
      sort_order: i,
      is_featured: i === 0 ? true : img.is_featured && i !== 0 ? false : false,
    }));
    // Ensure at least one featured
    if (newImages.length > 0 && !newImages.some((i) => i.is_featured)) {
      newImages[0].is_featured = true;
    }
    onChange(newImages);
  };

  const setFeatured = (index: number) => {
    onChange(images.map((img, i) => ({ ...img, is_featured: i === index })));
  };

  const updateAlt = (index: number, alt_text: string) => {
    onChange(images.map((img, i) => (i === index ? { ...img, alt_text } : img)));
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? "border-gold bg-gold/5 text-gold"
            : "border-border hover:border-foreground/40 text-muted-foreground"
        }`}
      >
        <Upload className="mx-auto h-8 w-8 mb-3 opacity-60" />
        <p className="text-sm font-medium">Drag & drop images here</p>
        <p className="text-xs mt-1 opacity-60">or click to browse · Max {maxImages} images · JPG, PNG, WebP</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, i) => (
            <div key={i} className="group relative">
              <div className="relative aspect-[3/4] overflow-hidden rounded border border-border bg-champagne/20">
                <img
                  src={img.preview || img.url}
                  alt={img.alt_text}
                  className="h-full w-full object-cover"
                />
                {img.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                  </div>
                )}
                {img.is_featured && (
                  <div className="absolute top-2 left-2 bg-gold text-gold-foreground text-[9px] uppercase tracking-widest px-1.5 py-0.5 font-semibold">
                    Primary
                  </div>
                )}
                <div className="absolute inset-0 bg-ink/0 opacity-0 group-hover:bg-ink/20 group-hover:opacity-100 transition-all" />
                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => setFeatured(i)}
                    className="p-1 bg-background/90 hover:bg-gold hover:text-gold-foreground transition-colors rounded"
                    title="Set as primary"
                  >
                    <Star className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="p-1 bg-background/90 hover:bg-destructive hover:text-white transition-colors rounded"
                    title="Remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={img.alt_text}
                onChange={(e) => updateAlt(i, e.target.value)}
                placeholder="Alt text..."
                className="mt-1 w-full border-0 border-b border-border bg-transparent px-0 py-1 text-[10px] focus:outline-none focus:border-foreground"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
