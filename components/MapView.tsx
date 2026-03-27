"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Langport centre
const DEFAULT_CENTER: [number, number] = [51.0374, -2.8287];
const DEFAULT_ZOOM = 14;

interface MapPin {
  id: string;
  title: string;
  href: string;
  lat: number;
  lng: number;
  category?: string;
  address?: string;
}

interface MapViewProps {
  pins: MapPin[];
  height?: string;
  center?: [number, number];
  zoom?: number;
}

export default function MapView({
  pins,
  height = "500px",
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
}: MapViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-xl bg-gray-100 text-gray-400"
      >
        Loading map...
      </div>
    );
  }

  return <MapInner pins={pins} height={height} center={center} zoom={zoom} />;
}

function MapInner({
  pins,
  height,
  center,
  zoom,
}: MapViewProps & { height: string }) {
  // Dynamic import to avoid SSR issues with Leaflet
  const [L, setL] = useState<typeof import("leaflet") | null>(null);
  const [ReactLeaflet, setReactLeaflet] = useState<typeof import("react-leaflet") | null>(null);

  useEffect(() => {
    Promise.all([import("leaflet"), import("react-leaflet")]).then(
      ([leaflet, rl]) => {
        setL(leaflet.default || leaflet);
        setReactLeaflet(rl);
      }
    );
  }, []);

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  }, []);

  if (!L || !ReactLeaflet) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-xl bg-gray-100 text-gray-400"
      >
        Loading map...
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup } = ReactLeaflet;

  // Fix default marker icon issue with webpack
  const icon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const validPins = pins.filter((p) => p.lat && p.lng);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: "100%" }}
      className="rounded-xl z-0"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validPins.map((pin) => (
        <Marker key={pin.id} position={[pin.lat, pin.lng]} icon={icon}>
          <Popup>
            <div className="text-sm">
              <Link
                href={pin.href}
                className="font-semibold text-primary no-underline hover:underline"
              >
                {pin.title}
              </Link>
              {pin.category && (
                <p className="text-xs text-gray-500 mt-0.5">{pin.category}</p>
              )}
              {pin.address && (
                <p className="text-xs text-gray-500 mt-0.5">{pin.address}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
