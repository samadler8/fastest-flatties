import { supabase } from "@/lib/supabase";
import GPXMap from "@/components/GPXMap";
import { 
  Mountain, 
  MapPin, 
  Trophy, 
  Clock, 
  Download, 
  ArrowLeft, 
  ShieldCheck, 
  Flag, 
  History 
} from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

function formatTimeDiff(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `-${h}h ${m}m ${s}s`;
  if (m > 0) return `-${m}m ${s}s`;
  return `-${s}s`;
}

type GroupedEffort = {
  id: string;
  time_seconds: number;
  formatted_time: string;
  activity_date: string;
  gpx_url?: string;
  gender?: string;
  support_type?: string;
  athletes: Array<{ id: string; name: string }>;
  timeDiff?: string;
};

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
    .maybeSingle();

  if (routeError) {
    console.error("Supabase Route Query Error:", routeError.message);
  }

  // 2. Fetch all verified efforts sorted by activity_date and time
  const { data: rawEfforts, error: effortError } = await supabase
    .from("efforts")
    .select("*, athlete:athletes(*)")
    .eq("route_id", id)
    .eq("verified", true)
    .order("activity_date", { ascending: true })
    .order("time_seconds", { ascending: true });

  if (effortError) {
    console.error("Supabase Efforts Query Error:", effortError.message);
  }

  if (!route) {
    return (
      <div className="min-h-screen bg-sandstone-950 text-sandstone-100 font-serif flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-bold text-sandstone-400">Route not found in database.</p>
        <p className="text-sm text-sandstone-400 font-mono">Query ID: {id}</p>
        <Link href="/" className="text-flatiron-red hover:underline text-sm font-mono">
          [ Return to Homepage ]
        </Link>
      </div>
    );
  }

  // 3. Group joint efforts (athletes sharing the exact same time & date)
  const groupedMap = new Map<string, GroupedEffort>();

  if (rawEfforts) {
    rawEfforts.forEach((e) => {
      const groupKey = `${e.time_seconds}_${e.activity_date}`;
      if (groupedMap.has(groupKey)) {
        const existing = groupedMap.get(groupKey)!;
        if (e.athlete && !existing.athletes.some(a => a.id === e.athlete.id)) {
          existing.athletes.push({ id: e.athlete.id, name: e.athlete.name });
        }
      } else {
        groupedMap.set(groupKey, {
          id: e.id,
          time_seconds: e.time_seconds,
          formatted_time: e.formatted_time,
          activity_date: e.activity_date,
          gpx_url: e.gpx_url,
          gender: e.gender || 'Male',
          support_type: e.support_type || 'Unsupported',
          athletes: e.athlete ? [{ id: e.athlete.id, name: e.athlete.name }] : []
        });
      }
    });
  }

  const groupedEfforts = Array.from(groupedMap.values());

  // Calculate Leaderboard (Sorted by fastest time ASC)
  const leaderboard = [...groupedEfforts].sort((a, b) => a.time_seconds - b.time_seconds);

  // Calculate FKT Record History Timeline
  const recordHistory: GroupedEffort[] = [];
  let fastestTimeSoFar = Infinity;

  groupedEfforts.forEach((effort) => {
    if (effort.time_seconds < fastestTimeSoFar) {
      const diff = fastestTimeSoFar === Infinity ? "Initial Benchmark Record" : formatTimeDiff(fastestTimeSoFar - effort.time_seconds);
      fastestTimeSoFar = effort.time_seconds;
      recordHistory.push({
        ...effort,
        timeDiff: diff
      });
    }
  });

  recordHistory.reverse();

  const rulesList = route.rules 
    ? route.rules.split("\n").filter((rule: string) => rule.trim().length > 0)
    : [];

  return (
    <div className="min-h-screen bg-sandstone-950 text-sandstone-100 font-serif pb-20">
      {/* Header Bar */}
      <div className="border-b-2 border-flatiron-red/40 bg-sandstone-900/90 backdrop-blur-md sticky top-0 z-40 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center font-mono text-xs uppercase tracking-widest text-sandstone-400 hover:text-flatiron-red transition-colors">
            <ArrowLeft size={14} className="mr-1.5" /> [ Back to Directory ]
          </Link>
          <span className="font-serif text-lg font-bold text-sandstone-100 flex items-center gap-2">
            <Mountain size={18} className="text-flatiron-red" /> FASTEST FATTIES
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        {/* Title & Banner */}
        <div className="bg-sandstone-900 border-2 border-sandstone-800 p-8 shadow-2xl space-y-4">
          <span className="font-mono text-xs text-flatiron-ochre uppercase tracking-widest block">
            === BOULDER FLATIRON SPEED RECORD ROUTE ===
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-sandstone-100 tracking-tight">
            {route.name}
          </h1>
          <p className="text-sandstone-200 text-lg leading-relaxed italic border-l-2 border-flatiron-red pl-4">
            "{route.description}"
          </p>
          
          <div className="flex flex-wrap gap-6 font-mono text-xs text-sandstone-100 bg-sandstone-950 border border-sandstone-800 p-3 inline-flex uppercase">
            <span className="text-flatiron-ochre">DIST: <strong className="text-sandstone-100">{route.distance_miles} MILES</strong></span>
            <span>|</span>
            <span className="text-flatiron-ochre">ELEV: <strong className="text-sandstone-100">{route.elevation_gain_ft} FT GAIN</strong></span>
          </div>
        </div>

        {/* Map Section */}
        <div>
          <h2 className="text-2xl font-serif font-bold text-sandstone-100 mb-4 flex items-center gap-2">
            <MapPin size={22} className="text-flatiron-red" /> Route Map & Topo
          </h2>
          {route.gpx_url ? (
            <GPXMap gpxUrl={route.gpx_url} />
          ) : (
            <div className="h-64 bg-sandstone-900 border-2 border-sandstone-800 flex items-center justify-center font-mono text-xs text-sandstone-400">
              [ NO GPX TRACK AVAILABLE ]
            </div>
          )}
        </div>

        {/* Current Speed Leaderboard */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <h2 className="text-2xl font-serif font-bold text-sandstone-100 flex items-center gap-2">
              <Trophy size={22} className="text-flatiron-gold" /> Current Leaderboard
            </h2>
            <span className="font-mono text-xs text-sandstone-400 uppercase">
              Ranked by fastest verified completion
            </span>
          </div>

          <div className="overflow-x-auto bg-sandstone-900 border-2 border-sandstone-800 shadow-2xl">
            <table className="w-full text-left font-mono text-xs text-sandstone-200">
              <thead className="bg-sandstone-950 text-flatiron-ochre uppercase border-b-2 border-sandstone-800">
                <tr>
                  <th className="px-6 py-4">RANK</th>
                  <th className="px-6 py-4">ATHLETE(S)</th>
                  <th className="px-6 py-4">CATEGORY</th>
                  <th className="px-6 py-4">TIME</th>
                  <th className="px-6 py-4">DATE</th>
                  <th className="px-6 py-4 text-right">GPX</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sandstone-800">
                {leaderboard.length > 0 ? (
                  leaderboard.map((effort, idx) => (
                    <tr key={effort.id} className="hover:bg-sandstone-800/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-flatiron-gold text-sm">
                        {idx === 0 ? "01 [FKT 👑]" : `#0${idx + 1}`}
                      </td>
                      <td className="px-6 py-4 font-serif text-base font-bold text-sandstone-100">
                        {effort.athletes.length > 0 ? (
                          effort.athletes.map((a, aIdx) => (
                            <span key={a.id}>
                              <Link href={`/athletes/${a.id}`} className="hover:text-flatiron-red transition-colors">
                                {a.name}
                              </Link>
                              {aIdx < effort.athletes.length - 1 && " & "}
                            </span>
                          ))
                        ) : (
                          "Unknown Athlete"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          <span className="bg-sandstone-950 border border-sandstone-700 text-sandstone-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                            {effort.gender}
                          </span>
                          <span className="bg-flatiron-rust/30 border border-flatiron-red/50 text-flatiron-red px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                            {effort.support_type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-flatiron-red text-sm">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={13} /> {effort.formatted_time}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sandstone-400">{effort.activity_date}</td>
                      <td className="px-6 py-4 text-right">
                        {effort.gpx_url && (
                          <a href={effort.gpx_url} download className="text-sandstone-400 hover:text-flatiron-red font-mono text-xs underline">
                            [DOWNLOAD]
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sandstone-400 font-mono">
                      [ NO VERIFIED EFFORTS RECORDED YET ]
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FKT Record History Timeline */}
        <div>
          <h2 className="text-2xl font-serif font-bold text-sandstone-100 mb-4 flex items-center gap-2">
            <History size={22} className="text-flatiron-ochre" /> FKT Record History Timeline
          </h2>

          <div className="bg-sandstone-900 border-2 border-sandstone-800 p-6 shadow-2xl space-y-6">
            {recordHistory.length > 0 ? (
              <div className="relative border-l-2 border-sandstone-800 ml-4 space-y-8 pl-6">
                {recordHistory.map((rec) => (
                  <div key={rec.id} className="relative group">
                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 bg-flatiron-red border-2 border-sandstone-950 rounded-full group-hover:scale-125 transition-transform" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-sandstone-950 border border-sandstone-800 p-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-serif font-bold text-lg text-sandstone-100">
                            {rec.athletes.map((a, aIdx) => (
                              <span key={a.id}>
                                {a.name}
                                {aIdx < rec.athletes.length - 1 && " & "}
                              </span>
                            ))}
                          </span>
                          <span className="font-mono text-xs text-flatiron-gold bg-sandstone-900 px-2 py-0.5 border border-sandstone-800">
                            {rec.timeDiff}
                          </span>
                        </div>
                        <div className="font-mono text-xs text-sandstone-400 flex items-center gap-3">
                          <span>DATE: {rec.activity_date}</span>
                          <span>|</span>
                          <span className="uppercase text-sandstone-300">{rec.gender} / {rec.support_type}</span>
                        </div>
                      </div>

                      <div className="font-mono text-xl font-bold text-flatiron-red">
                        {rec.formatted_time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-mono text-xs text-sandstone-400 text-center py-4">
                [ NO RECORD PROGRESSION HISTORY RECORDED ]
              </p>
            )}
          </div>
        </div>

        {/* Start/Finish & Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {route.start_finish && (
            <div className="bg-sandstone-900 border-2 border-sandstone-800 p-6 shadow-xl">
              <h3 className="text-lg font-serif font-bold text-sandstone-100 mb-3 flex items-center gap-2">
                <Flag size={18} className="text-flatiron-red" /> Start & Finish Location
              </h3>
              <p className="text-sandstone-200 text-sm leading-relaxed font-serif">
                {route.start_finish}
              </p>
            </div>
          )}

          {rulesList.length > 0 && (
            <div className="bg-sandstone-900 border-2 border-sandstone-800 p-6 shadow-xl">
              <h3 className="text-lg font-serif font-bold text-sandstone-100 mb-3 flex items-center gap-2">
                <ShieldCheck size={18} className="text-flatiron-red" /> Route Rules & Standards
              </h3>
              <ul className="space-y-2 text-sm text-sandstone-200 font-serif">
                {rulesList.map((rule: string, i: number) => (
                  <li key={i} className="leading-relaxed">
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}