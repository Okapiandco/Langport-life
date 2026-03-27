"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface VenueQRCodeProps {
  venueUrl: string;
  venueName: string;
}

export default function VenueQRCode({ venueUrl, venueName }: VenueQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, venueUrl, {
      width: 200,
      margin: 2,
      color: { dark: "#1a1a1a", light: "#ffffff" },
    }).then(() => {
      setDataUrl(canvasRef.current?.toDataURL("image/png") || "");
    });
  }, [venueUrl]);

  function handleDownload() {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = `${venueName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-qr.png`;
    link.href = dataUrl;
    link.click();
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-6">
      <canvas ref={canvasRef} className="rounded-lg" />
      <p className="text-xs text-gray-500 text-center">
        Scan to visit this venue&apos;s page
      </p>
      <button
        onClick={handleDownload}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
      >
        Download QR Code
      </button>
    </div>
  );
}
