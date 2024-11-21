"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { toast } from 'react-hot-toast'
import Image from "next/image";

export default function ImageUploader() {
  const [image, setImage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Convert the file to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      setImage(base64String);
      
      try {
        setLoading(true);
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: base64String }),
        });

        if (!response.ok) throw new Error("Failed to generate suggestions");

        const data = await response.json();
        setSuggestions(data.suggestions);
      } catch (error) {
        toast.error(
         
          "Failed to generate suggestions. Please try again."
        
        );
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card
        {...getRootProps()}
        className={`p-8 border-2 border-dashed cursor-pointer transition-colors ${
          isDragActive ? "border-primary" : "border-muted"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <Upload className="h-12 w-12 text-muted-foreground" />
          <div>
            <p className="text-lg font-medium">
              Drop your image here, or click to select
            </p>
            <p className="text-sm text-muted-foreground">
              Support for JPG, PNG and WebP
            </p>
          </div>
        </div>
      </Card>

      {image && (
        <div className="space-y-6">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <Image
              src={image}
              alt="Uploaded waste item"
              fill
              className="object-contain"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Generating suggestions...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">DIY Suggestions</h2>
              <div className="grid gap-4">
                {suggestions.map((suggestion, index) => (
                  <Card key={index} className="p-4">
                    {suggestion}
                  </Card>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setImage(null);
                setSuggestions([]);
              }}
            >
              Upload Another Image
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}