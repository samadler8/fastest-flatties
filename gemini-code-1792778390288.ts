"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import gpxParser from "gpxparser";

// Fix for default Leaflet icon issues in React
import iconSettings from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconSettings.src,
  iconUrl: iconUrl.src,
  shadowUrl: shadowUrl.src,
});

// Helper component to auto-zoom the map to the GPX track
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  
  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(positions, { padding: [20, 20] });
    }
  }, [map, positions]);
  
  return null;
}

export default function MapInner({ gpxUrl }: { gpxUrl?: string }) {
  const [positions, setPositions] = useState<[number, number][]>([]);

  useEffect(() => {
    async function fetchAndParseGPX() {
      if (!gpxUrl) return;
      
      try {
        const response = await fetch(gpxUrl);
        if (!response.ok) throw new Error("Failed to fetch GPX file");
        
        const gpxText = await response.text();
        const gpx = new gpxParser();
        gpx.parse(gpxText);

        // Extract coordinates from the first track in the GPX file
        if (gpx.tracks && gpx.tracks.length > 0) {
          const trackPoints: [number, number][] = gpx.tracks[0].points.map(
            (p: { lat: number; lon: number }) => [p.lat, p.lon]
          );
          setPositions(trackPoints);
        }
      } catch (error) {
        console.error("Error loading GPX map data:", error);
      }
    }

    fetchAndParseGPX();
  }, [gpxUrl]);

  return (
    <MapContainer 
      center={[39.988, -105.293]} // Defaults to Boulder Flatirons
      zoom={14} 
      className="h-full w-full"
      style={{ minHeight: "100%" }}
    >
      <TileLayer
        attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
      />
      
      {positions.length > 0 && (
        <>
          <Polyline 
            positions={positions} 
            pathOptions={{ color: "red", weight: 4, opacity: 0.8 }} 
          />
          <FitBounds positions={positions} />
        </>
      )}
    </MapContainer>
  );
}