"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import RouteDocViewer from "@/components/RouteDocViewer";

const RouteRulesMap = dynamic(() => import("./RouteRulesMap"), { 
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-sandstone-900 border-2 border-sandstone-800 flex flex-col items-center justify-center text-sandstone-400 font-mono text-sm">
      <span>[ LOADING MAP... ]</span>
    </div>
  )
});

export default function RouteRulesSection({
  gpxUrl,
  rulesMarkdown,
  rulesGeoJSON,
}: {
  gpxUrl?: string;
  rulesMarkdown?: string;
  rulesGeoJSON?: any;
}) {
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Specification Document Column */}
      <div>
        {rulesMarkdown ? (
          <RouteDocViewer
            markdown={rulesMarkdown}
            activeFeatureId={activeFeatureId}
            onSelectFeature={(id) => setActiveFeatureId(id)}
          />
        ) : (
          <div className="bg-sandstone-900 border-2 border-sandstone-800 p-6 font-mono text-xs text-sandstone-400">
            [ NO DETAILED SPECIFICATION DOCUMENT UPLOADED ]
          </div>
        )}
      </div>

      {/* Geofenced Map Column */}
      <div className="lg:sticky lg:top-20 space-y-2">
        <RouteRulesMap
          gpxUrl={gpxUrl}
          rulesGeoJSON={rulesGeoJSON}
          activeFeatureId={activeFeatureId}
          onSelectFeature={(id) => setActiveFeatureId(id)}
        />
        {activeFeatureId && (
          <button
            onClick={() => setActiveFeatureId(null)}
            className="font-mono text-xs text-sandstone-400 hover:text-flatiron-red underline w-full text-center"
          >
            [ Reset Map View ]
          </button>
        )}
      </div>
    </div>
  );
}