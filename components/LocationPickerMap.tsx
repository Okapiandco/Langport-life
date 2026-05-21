"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import type { LeafletMouseEvent } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix broken default icon URLs in webpack/Next.js builds
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
  lat: number;
  lng: number;
  onMove: (lat: number, lng: number) => void;
}

// Re-centres the map whenever the lat/lng props change (e.g. after geocoding)
function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 17);
  }, [lat, lng, map]);
  return null;
}

// Draggable marker + click-to-move
function DraggableMarker({ lat, lng, onMove }: Props) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onMove(e.latlng.lat, e.latlng.lng);
    },
  });
  return (
    <Marker
      position={[lat, lng]}
      draggable
      eventHandlers={{
        dragend(e) {
          const ll = e.target.getLatLng();
          onMove(ll.lat, ll.lng);
        },
      }}
    />
  );
}

export default function LocationPickerMap({ lat, lng, onMove }: Props) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={17}
      className="h-64 w-full rounded-lg"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater lat={lat} lng={lng} />
      <DraggableMarker lat={lat} lng={lng} onMove={onMove} />
    </MapContainer>
  );
}
