"use client";

import { useState } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity";

interface GalleryProps {
  images: any[];
  title: string;
}

export default function Gallery({ images, title }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  function close() { setSelectedIndex(null); }
  function prev() { setSelectedIndex((i) => (i !== null && i > 0 ? i - 1 : images.length - 1)); }
  function next() { setSelectedIndex((i) => (i !== null && i < images.length - 1 ? i + 1 : 0)); }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-gray-900">Gallery</h2>
        <span className="text-sm text-gray-500">{images.length} photos</span>
      </div>

      {/* Thumbnail grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img: any, i: number) => (
          <button
            key={i}
            onClick={() => setSelectedIndex(i)}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={`View photo ${i + 1} of ${images.length}`}
          >
            <Image
              src={urlFor(img).width(300).height(225).url()}
              alt={img.alt || `${title} photo ${i + 1}`}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Close button */}
          <button
            onClick={close}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            aria-label="Close lightbox"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Prev button */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            aria-label="Previous image"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Image */}
          <div
            className="relative max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={urlFor(images[selectedIndex]).width(1200).height(800).url()}
              alt={images[selectedIndex].alt || `${title} photo ${selectedIndex + 1}`}
              width={1200}
              height={800}
              className="max-h-[85vh] w-auto rounded-lg object-contain"
            />
            {images[selectedIndex].alt && (
              <p className="mt-2 text-center text-sm text-white/70">
                {images[selectedIndex].alt}
              </p>
            )}
            <p className="mt-1 text-center text-xs text-white/50">
              {selectedIndex + 1} / {images.length}
            </p>
          </div>

          {/* Next button */}
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            aria-label="Next image"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
