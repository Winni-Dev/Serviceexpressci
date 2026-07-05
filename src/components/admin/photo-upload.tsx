import { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { getAvatarUrl } from '@/lib/utils';
import type { Gender } from '@/types';

interface PhotoUploadProps {
  gender: Gender;
  currentUrl?: string;
  onFileChange: (file: File | null) => void;
  label?: string;
}

export function PhotoUpload({ gender, currentUrl, onFileChange, label = 'Photo (optionnelle)' }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const displayUrl = preview || currentUrl || getAvatarUrl(gender);

  const handleFile = (file: File | null) => {
    if (preview) URL.revokeObjectURL(preview);
    if (file) {
      setPreview(URL.createObjectURL(file));
      onFileChange(file);
    } else {
      setPreview(null);
      onFileChange(null);
    }
  };

  const clearPhoto = () => {
    handleFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-medium text-gray-700 self-start">{label}</p>
      <div className="relative group">
        <img
          src={displayUrl}
          alt="Aperçu"
          className="w-24 h-24 rounded-2xl object-cover ring-4 ring-gray-100 shadow-sm"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Camera className="w-6 h-6 text-white" />
        </button>
        {(preview || currentUrl) && (
          <button
            type="button"
            onClick={clearPhoto}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:bg-red-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-xs text-[#FF6600] hover:underline"
      >
        Choisir une photo
      </button>
    </div>
  );
}
