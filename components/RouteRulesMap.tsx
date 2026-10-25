"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type GeoJSONFeature = {
  id: string;
  properties: {
    name: string;
    type: "checkpoint" | "freestyle_zone" | "corridor";
    radius_meters?: number;
    sequence_order?: number;
    description?: string;
  };
  geometry: any;
};

export default function RouteRulesMap({
  gpxUrl,
  rulesGeoJSON,
  activeFeatureId,
  onSelectFeature,
}: {
  gpxUrl?: string;
  rulesGeoJSON?: { features: GeoJSONFeature[] };
  activeFeatureId: string | null;
  onSelectFeature: (id: string) => void;
}) {
  const mapRef = useRef<L.Map | null>(null);
  const layerMapRef = useRef<Map<string, L.Layer>>(new Map());
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [39.9881, -105.2925],
      zoom: 14,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    mapRef.current = map;
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !rulesGeoJSON?.features) return;

    layerMapRef.current.clear();

    rulesGeoJSON.features.forEach((feature) => {
      const { id, properties, geometry } = feature;

      if (properties.type === "checkpoint" && geometry.type === "Point") {
        const [lng, lat] = geometry.coordinates;

        const circle = L.circle([lat, lng], {
          radius: properties.radius_meters || 15,
          color: activeFeatureId === id ? "#f59e0b" : "#c04a29",
          fillColor: activeFeatureId === id ? "#f59e0b" : "#c04a29",
          fillOpacity: 0.35,
          weight: activeFeatureId === id ? 3 : 2,
        }).addTo(map);

        circle.bindTooltip(
          `<strong>#${properties.sequence_order} ${properties.name}</strong><br/>Radius: ${properties.radius_meters}m`,
          { className: "font-mono text-xs" }
        );

        circle.on("click", () => onSelectFeature(id));
        layerMapRef.current.set(id, circle);
      } else if (properties.type === "freestyle_zone" && geometry.type === "Polygon") {
        const polygon = L.geoJSON(geometry, {
          style: {
            color: activeFeatureId === id ? "#f59e0b" : "#d97706",
            fillColor: "#d97706",
            fillOpacity: 0.15,
            dashArray: "4, 4",
          },
        }).addTo(map);

        polygon.on("click", () => onSelectFeature(id));
        layerMapRef.current.set(id, polygon);
      }
    });
  }, [rulesGeoJSON, activeFeatureId, onSelectFeature]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeFeatureId) return;

    const targetLayer = layerMapRef.current.get(activeFeatureId);
    if (targetLayer) {
      if ("getBounds" in targetLayer) {
        map.fitBounds((targetLayer as L.Polygon).getBounds(), { padding: [50, 50], maxZoom: 16 });
      } else if ("getLatLng" in targetLayer) {
        map.setView((targetLayer as L.Circle).getLatLng(), 16, { animate: true });
      }
    }
  }, [activeFeatureId]);

  return (
    <div className="relative w-full h-[500px] border-2 border-sandstone-800 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full bg-sandstone-950" />
      <div className="absolute top-3 right-3 bg-sandstone-950/90 border border-sandstone-800 p-2 font-mono text-[10px] text-sandstone-300 z-[1000] space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-flatiron-red inline-block" /> Required Checkpoint Radius
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 border border-dashed border-flatiron-ochre inline-block" /> Freestyle Zone
        </div>
      </div>
    </div>
  );
}