'use client';

import { useState, useRef } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { useAuthStore } from '@/store/authStore';
import type { CloudinaryImage } from '@/types';

interface ImageUploaderProps {
  images: CloudinaryImage[];
  onChange: (images: CloudinaryImage[]) => void;
  maxImages?: number;
  folder?: string;
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 6,
  folder = 'products',
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { firebaseUser } = useAuthStore();

  const handleUpload = async (files: FileList | File[]) => {
    if (!files.length || images.length >= maxImages) return;

    setUploading(true);
    const newImages = [...images];

    try {
      const token = await firebaseUser?.getIdToken();

      for (let i = 0; i < files.length; i++) {
        if (newImages.length >= maxImages) break;

        const file = files[i];
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) continue;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          newImages.push({ url: data.url, publicId: data.publicId });
        }
      }
      onChange(newImages);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (img: CloudinaryImage) => {
    try {
      if (img.publicId) {
        const token = await firebaseUser?.getIdToken();
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ publicId: img.publicId }),
        });
        onChange(images.filter((i) => i.publicId !== img.publicId));
      } else {
        onChange(images.filter((i) => i.url !== img.url));
      }
    } catch (error) {
      console.error('Failed to remove image:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <div key={img.publicId ?? img.url} className="relative aspect-square bg-[#f6f3ed] overflow-hidden border border-[#d0c5af]">
            <CldImage
              src={img.url}
              alt={`Upload ${idx}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <button
              type="button"
              onClick={() => handleRemove(img)}
              className="absolute top-2 right-2 p-1 bg-[#fcf9f3] text-[#1c1c18] border border-[#d0c5af] hover:bg-[#8f0402] hover:text-[#fcf9f3] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            {idx === 0 && (
              <span className="absolute bottom-2 left-2 px-2 py-1 bg-[#fcf9f3] border border-[#d0c5af] text-[11px] tracking-[0.18em] uppercase text-[#1c1c18]">
                Main
              </span>
            )}
          </div>
        ))}
        
        {images.length < maxImages && (
          <div
            className={`relative aspect-square border border-dashed transition-colors flex flex-col items-center justify-center text-center p-4 cursor-pointer bg-[#ffffff]
              ${isDragging ? 'border-[#d4af37] bg-[#d4af37]/10' : 'border-[#d0c5af] hover:border-[#d4af37]'}
            `}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleUpload(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin mb-2" />
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-[#7f7663] mb-2" />
                <span className="text-xs tracking-[0.18em] uppercase text-[#7f7663]">Click or drag</span>
              </>
            )}
          </div>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept="image/jpeg, image/png, image/webp"
        onChange={(e) => e.target.files && handleUpload(e.target.files)}
      />
    </div>
  );
}
