"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import gpxParser from 'gpxparser';

interface MapInnerProps {
  gpxUrl: string;
}

function AutoFitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(positions);
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
        const gpxText = await response.text();
        const gpx = new gpxParser();
        gpx.parse(gpxText);

        if (gpx.tracks && gpx.tracks[0]) {
          const trackPoints = gpx.tracks[0].points.map((pt) => [pt.lat, pt.lon] as [number, number]);
          setPositions(trackPoints);
        }
      } catch (err) {
        console.error("Error fetching or parsing GPX file:", err);
      }
    }

    if (gpxUrl) {
      fetchGPX();
    }
  }, [gpxUrl]);

  const defaultCenter: [number, number] = positions[0] || [40.0001, -105.2828];

  return (
    <div className="h-96 w-full rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative z-0">
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