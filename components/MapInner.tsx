"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import GpxParser from 'gpxparser';

interface MapInnerProps {
  gpxUrl: string;
}

function AutoFitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(positions, { padding: [30, 30] });
    }
  }, [map, positions]);
  return null;
}

export default function MapInner({ gpxUrl }: MapInnerProps) {
  const [positions, setPositions] = useState<[number, number][]>([]);

  useEffect(() => {
    async function fetchGPX() {
      try {
        const response = await fetch(gpxUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch GPX: ${response.statusText}`);
        }
        const gpxText = await response.text();
        
        // Parse GPX text
        const gpx = new GpxParser();
        gpx.parse(gpxText);

        if (gpx.tracks && gpx.tracks.length > 0 && gpx.tracks[0].points) {
          const trackPoints = gpx.tracks[0].points.map(
            (pt) => [pt.lat, pt.lon] as [number, number]
          );
          setPositions(trackPoints);
        }
      } catch (err) {
        console.error("GPX map render error:", err);
      }
    }

    if (gpxUrl) {
      fetchGPX();
    }
  }, [gpxUrl]);

  // Fallback map center: First Flatiron, Boulder CO
  const defaultCenter: [number, number] = [39.9888, -105.2931];

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative z-0 bg-slate-900">
      <MapContainer
        center={defaultCenter}
        zoom={14}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {positions.length > 0 && (
          <>
            <Polyline positions={positions} color="#10b981" weight={4} opacity={0.9} />
            <AutoFitBounds positions={positions} />
          </>
        )}
      </MapContainer>
    </div>
  );
}