"use client";

import dynamic from 'next/dynamic';

const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="h-96 w-full rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
      Loading route map...
    </div>
  ),
});

export default function GPXMap({ gpxUrl }: { gpxUrl: string }) {
  return <MapInner gpxUrl={gpxUrl} />;
}