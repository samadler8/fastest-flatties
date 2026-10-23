"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the map component with SSR disabled
const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-400">
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="ml-2 text-sm font-medium">Loading Map...</span>
    </div>
  ),
});

export default function GPXMap() {
  return (
    <div className="h-[400px] w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white relative z-0">
      <MapInner />
    </div>
  );
}