import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import GPXMap from "@/components/GPXMap";
import { ArrowLeft, Download, Medal, Mountain, Route as RouteIcon } from "lucide-react";
import { format } from "date-fns";

// Revalidate this page every 60 seconds (optional, for ISR)
export const revalidate = 60;

export default async function RouteDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // 1. Fetch Route Details
  const { data: route, error: routeError } = await supabase
    .from("routes")
    .select("*")
    .eq("id", id)
    .single();

  if (routeError || !route) {
    notFound();
  }

  // 2. Fetch Verified Efforts + Athlete Names
  const { data: efforts, error: effortsError } = await supabase
    .from("efforts")
    .select(`
      *,
      athlete:athletes(name)
    `)
    .eq("route_id", id)
    .eq("verified", true)
    .order("time_seconds", { ascending: true });

  if (effortsError) {
    console.error("Error fetching efforts:", effortsError);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Routes
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{route.name}</h1>
              <p className="mt-2 text-gray-600 max-w-2xl">{route.description}</p>
            </div>
            <div className="flex items-center gap-6 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2">
                <RouteIcon className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Distance</p>
                  <p className="text-lg font-bold text-gray-900">{route.distance_miles} mi</p>
                </div>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="flex items-center gap-2">
                <Mountain className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Elevation</p>
                  <p className="text-lg font-bold text-gray-900">{route.elevation_gain_ft?.toLocaleString()} ft</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Map Section */}
        {route.gpx_url && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 h-[450px]">
            <GPXMap gpxUrl={route.gpx_url} />
          </div>
        )}

        {/* Leaderboard Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-900">Leaderboard</h2>
            <p className="text-sm text-gray-500 mt-1">Verified Fastest Known Times</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-semibold">Rank</th>
                  <th className="px-6 py-4 font-semibold">Athlete</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Time</th>
                  <th className="px-6 py-4 font-semibold text-center">GPX</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {efforts && efforts.length > 0 ? (
                  efforts.map((effort, index) => {
                    const rank = index + 1;
                    return (
                      <tr key={effort.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 font-bold text-gray-900">
                            {rank === 1 && <Medal className="w-5 h-5 text-yellow-500" />}
                            {rank === 2 && <Medal className="w-5 h-5 text-gray-400" />}
                            {rank === 3 && <Medal className="w-5 h-5 text-amber-600" />}
                            {rank > 3 && <span className="w-5 text-center text-gray-400">#{rank}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {/* @ts-ignore - Handle nested join typing */}
                          {effort.athlete?.name || "Unknown Athlete"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                          {format(new Date(effort.activity_date), "MMM d, yyyy")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold text-gray-900">
                          {effort.formatted_time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {effort.gpx_url ? (
                            <a 
                              href={effort.gpx_url} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                              title="Download GPX"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No verified times yet. Be the first to submit an FKT!
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