import { supabase } from "@/lib/supabase";
import GPXMap from "@/components/GPXMap";
import { Mountain, MapPin, TrendingUp, Trophy, Clock, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Force Next.js to fetch fresh data from Supabase on every request
export const dynamic = 'force-dynamic';

export default async function RoutePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  // 1. Fetch Route Details
  const { data: route, error: routeError } = await supabase
    .from("routes")
    .select("*")
    .eq("id", id)
    .single();

  if (routeError) {
    console.error("Supabase Route Query Error:", routeError);
  }

  // 2. Fetch Verified Efforts for this Route
  const { data: efforts, error: effortError } = await supabase
    .from("efforts")
    .select("*, athlete:athletes(*)")
    .eq("route_id", id)
    .eq("verified", true)
    .order("time_seconds", { ascending: true });

  if (effortError) {
    console.error("Supabase Efforts Query Error:", effortError);
  }

  if (!route) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-bold text-slate-300">Route not found in database.</p>
        <p className="text-sm text-slate-500 font-mono">Query ID: {id}</p>
        <Link href="/" className="text-emerald-400 hover:underline text-sm">
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Header Bar */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors">
            <ArrowLeft size={16} className="mr-1.5" /> Back to Routes
          </Link>
          <span className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
            <Mountain size={16} className="text-emerald-400" /> Boulder Flatirons
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Title & Stats Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">{route.name}</h1>
          <p className="text-slate-400 max-w-3xl text-base leading-relaxed mb-6">{route.description}</p>
          
          <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-300 bg-slate-900 border border-slate-800 p-4 rounded-xl inline-flex">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-emerald-400" />
              <span>{route.distance_miles} miles</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              <span>{route.elevation_gain_ft} ft gain</span>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4">Route Track</h2>
          {route.gpx_url ? (
            <GPXMap gpxUrl={route.gpx_url} />
          ) : (
            <div className="h-64 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center text-slate-500">
              No GPX track uploaded for this route yet.
            </div>
          )}
        </div>

        {/* Leaderboard Table */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-amber-400" /> Speed Leaderboard
          </h2>

          <div className="overflow-x-auto bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Athlete</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">GPX</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {efforts && efforts.length > 0 ? (
                  efforts.map((effort, idx) => (
                    <tr key={effort.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">
                        {idx === 0 ? <span className="text-amber-400 font-extrabold text-base">#1 👑</span> : `#${idx + 1}`}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {effort.athlete?.name || "Unknown Athlete"}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={14} /> {effort.formatted_time}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{effort.activity_date}</td>
                      <td className="px-6 py-4 text-right">
                        {effort.gpx_url && (
                          <a href={effort.gpx_url} download className="text-slate-400 hover:text-emerald-400 transition-colors inline-block p-1">
                            <Download size={16} />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No verified efforts recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}