"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface ImageUploadFieldProps {
  label?: string;
  onFileChange: (file: File | null) => void;
}

export default function ImageUploadField({
  label = "Image",
  onFileChange,
}: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (preview) URL.revokeObjectURL(preview);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview("");
    }
    onFileChange(file);
  }

  function clear() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">
        {label} <span className="text-gray-400">(optional)</span>
      </p>

      {preview ? (
        <div>
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-gray-200">
            <Image src={preview} alt="Preview" fill className="object-cover" />
          </div>
          <button
            type="button"
            onClick={clear}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Remove image
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-6 py-10 text-center hover:border-primary transition-colors">
          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
          <span className="text-sm text-gray-600">Click to upload a photo</span>
          <span className="text-xs text-gray-400">JPEG, PNG or WebP — max 8 MB</span>
          <span className="text-xs text-amber-600">Best as a 16:9 landscape image — portrait or square shots will be cropped</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={handleChange}
          />
        </label>
      )}
    </div>
  );
}
