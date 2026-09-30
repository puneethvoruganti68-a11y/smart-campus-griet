'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon, Camera, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (base64: string | undefined) => void;
  initialImage?: string;
}

export default function ImageUploader({ onImageSelected, initialImage }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onImageSelected(result);
      setIsLoading(false);
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const removeImage = () => {
    setPreview(null);
    onImageSelected(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  if (preview) {
    return (
      <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-video max-h-[300px] flex items-center justify-center">
        <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain" />
        <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-slate-800 p-2 rounded-full hover:bg-slate-100 transition-colors"
              title="Replace image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={removeImage}
              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              title="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleChange} 
          accept="image/*" 
          className="hidden" 
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={`
          border-2 border-dashed rounded-xl p-6 transition-colors text-center cursor-pointer
          ${isDragging ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleChange} 
          accept="image/*" 
          className="hidden" 
        />
        <input 
          type="file" 
          ref={cameraInputRef} 
          onChange={handleChange} 
          accept="image/*" 
          capture="environment"
          className="hidden" 
        />
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
            <p className="text-sm text-slate-500 font-medium">Processing image...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2">
            <UploadCloud className={`w-10 h-10 mb-3 ${error ? 'text-red-400' : 'text-slate-400'}`} />
            <p className="text-sm font-medium text-slate-700 mb-1">
              Click or drag image here
            </p>
            <p className="text-xs text-slate-500 mb-4">
              JPG, PNG up to 5MB
            </p>
            <div className="flex gap-2 w-full max-w-xs mx-auto mt-2" onClick={(e) => e.stopPropagation()}>
              <button 
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <Camera className="w-4 h-4" /> Camera
              </button>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <ImageIcon className="w-4 h-4" /> Gallery
              </button>
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
    </div>
  );
}
