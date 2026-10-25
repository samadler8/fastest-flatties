import { supabase } from "@/lib/supabase";
import { 
  Mountain, 
  MapPin, 
  Trophy, 
  Clock, 
  Download, 
  ArrowLeft, 
  History,
  Tag,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import RouteRulesSection from "@/components/RouteRulesSection";

export const dynamic = 'force-dynamic';

function formatTimeDiff(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `-${h}h ${m}m ${s}s`;
  if (m > 0) return `-${m}m ${s}s`;
  return `-${s}s`;
}

type CategoryDefinition = {
  group: string;
  definitions: Array<{ name: string; description?: string }>;
};

type GroupedEffort = {
  id: string;
  time_seconds: number;
  formatted_time: string;
  activity_date: string;
  gpx_url?: string;
  category_tags: string[];
  athletes: Array<{ id: string; name: string }>;
  timeDiff?: string;
  isRecordBreaker?: boolean;
};

export default async function RoutePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  // 1. Fetch Route
  const { data: route, error: routeError } = await supabase
    .from("routes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (routeError) {
    console.error("Supabase Route Query Error:", routeError.message);
  }

  // 2. Fetch Verified Efforts ordered by date
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

  // Group joint efforts
  const groupedEfforts: GroupedEffort[] = [];
  
  if (rawEfforts) {
    rawEfforts.forEach((e) => {
      const matchingGroup = groupedEfforts.find(group => 
        group.activity_date === e.activity_date &&
        JSON.stringify(group.category_tags.sort()) === JSON.stringify((e.category_tags || []).sort()) &&
        Math.abs(group.time_seconds - e.time_seconds) <= 45
      );
      
      if (matchingGroup) {
        if (e.athlete && !matchingGroup.athletes.some(a => a.id === e.athlete.id)) {
          matchingGroup.athletes.push({ id: e.athlete.id, name: e.athlete.name });
        }
      } else {
        groupedEfforts.push({
          id: e.id,
          time_seconds: e.time_seconds,
          formatted_time: e.formatted_time,
          activity_date: e.activity_date,
          gpx_url: e.gpx_url,
          category_tags: e.category_tags || [],
          athletes: e.athlete ? [{ id: e.athlete.id, name: e.athlete.name }] : []
        });
      }
    });
  }

  const leaderboard = [...groupedEfforts].sort((a, b) => a.time_seconds - b.time_seconds);

  // FKT History Calculation with Cross-Support Validation Rule
  const fastestTimes: Record<string, number> = {};
  const recordHistory: GroupedEffort[] = [];

  groupedEfforts.forEach((effort) => {
    const isSupported = effort.category_tags.includes("Supported");
    const isUnsupported = effort.category_tags.includes("Unsupported");

    const primaryCat = effort.category_tags.find(t =>
      ["Male", "Female", "Non-Binary", "Team"].includes(t)
    ) || "Overall";

    const catSupportedKey = `${primaryCat}_Supported`;
    const catUnsupportedKey = `${primaryCat}_Unsupported`;

    const prevSupportedBest = fastestTimes[catSupportedKey] || Infinity;
    const currentUnsupportedBest = fastestTimes[catUnsupportedKey] || Infinity;

    let qualifiesAsRecord = false;

    if (isUnsupported) {
      if (effort.time_seconds < currentUnsupportedBest) {
        qualifiesAsRecord = true;
        fastestTimes[catUnsupportedKey] = effort.time_seconds;
      }
    } else if (isSupported) {
      if (
        effort.time_seconds < prevSupportedBest &&
        effort.time_seconds < currentUnsupportedBest
      ) {
        qualifiesAsRecord = true;
        fastestTimes[catSupportedKey] = effort.time_seconds;
      }
    } else {
      const genKey = `${primaryCat}_Overall`;
      if (effort.time_seconds < (fastestTimes[genKey] || Infinity)) {
        qualifiesAsRecord = true;
        fastestTimes[genKey] = effort.time_seconds;
      }
    }

    if (qualifiesAsRecord) {
      recordHistory.push({
        ...effort,
        isRecordBreaker: true
      });
    }
  });

  recordHistory.reverse();

  const categoryGroups: CategoryDefinition[] = route.category_definitions || [];

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
        {/* Banner */}
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

        {/* Dynamic Category Definitions */}
        {categoryGroups.length > 0 && (
          <div className="bg-sandstone-900 border-2 border-sandstone-800 p-6 shadow-xl space-y-6">
            <h3 className="text-xl font-serif font-bold text-sandstone-100 flex items-center gap-2">
              <Tag size={20} className="text-flatiron-ochre" /> Route Category Definitions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoryGroups.map((group) => (
                <div key={group.group} className="bg-sandstone-950 border border-sandstone-800 p-4 space-y-3">
                  <span className="font-mono text-xs font-bold text-flatiron-ochre uppercase border-b border-sandstone-800 block pb-1">
                    {group.group}
                  </span>
                  <ul className="space-y-2">
                    {group.definitions.map((def) => (
                      <li key={def.name} className="text-xs font-serif">
                        <strong className="text-sandstone-100 uppercase font-mono mr-1.5">{def.name}:</strong>
                        <span className="text-sandstone-300">{def.description || "Standard route category."}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Rules & Specification Document with Geofenced Map */}
        <div>
          <h2 className="text-2xl font-serif font-bold text-sandstone-100 mb-4 flex items-center gap-2">
            <BookOpen size={22} className="text-flatiron-red" /> Interactive Route Specification & Map
          </h2>
          <RouteRulesSection
            gpxUrl={route.gpx_url}
            rulesMarkdown={route.rules_markdown}
            rulesGeoJSON={route.rules_geojson}
          />
        </div>

        {/* Current Speed Leaderboard */}
        <div>
          <h2 className="text-2xl font-serif font-bold text-sandstone-100 mb-4 flex items-center gap-2">
            <Trophy size={22} className="text-flatiron-gold" /> Current Leaderboard
          </h2>

          <div className="overflow-x-auto bg-sandstone-900 border-2 border-sandstone-800 shadow-2xl">
            <table className="w-full text-left font-mono text-xs text-sandstone-200">
              <thead className="bg-sandstone-950 text-flatiron-ochre uppercase border-b-2 border-sandstone-800">
                <tr>
                  <th className="px-6 py-4">RANK</th>
                  <th className="px-6 py-4">ATHLETE(S)</th>
                  <th className="px-6 py-4">CATEGORIES</th>
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
                        {effort.athletes.map((a, aIdx) => (
                          <span key={a.id}>
                            <Link href={`/athletes/${a.id}`} className="hover:text-flatiron-red transition-colors">
                              {a.name}
                            </Link>
                             {aIdx < effort.athletes.length - 1 && " & "}
                          </span>
                        ))}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {effort.category_tags.map((tag) => (
                            <span key={tag} className="bg-sandstone-950 border border-sandstone-700 text-sandstone-200 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                              {tag}
                            </span>
                          ))}
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

        {/* FKT Progression Timeline */}
        <div>
          <h2 className="text-2xl font-serif font-bold text-sandstone-100 mb-2 flex items-center gap-2">
            <History size={22} className="text-flatiron-ochre" /> Verified FKT Progression History
          </h2>
          <p className="font-mono text-xs text-sandstone-400 mb-4">
            Supported attempts only qualify as record-breakers if they surpass the existing Unsupported time for that category.
          </p>

          <div className="bg-sandstone-900 border-2 border-sandstone-800 p-6 shadow-2xl">
            {recordHistory.length > 0 ? (
              <div className="relative border-l-2 border-sandstone-800 ml-4 space-y-6 pl-6">
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
                        </div>
                        <div className="font-mono text-xs text-sandstone-400 flex items-center gap-2 flex-wrap">
                          <span>DATE: {rec.activity_date}</span>
                          <span>|</span>
                          <div className="flex gap-1">
                            {rec.category_tags.map(t => (
                              <span key={t} className="text-flatiron-ochre uppercase font-bold bg-sandstone-900 px-1.5 py-0.5 border border-sandstone-800">
                                {t}
                              </span>
                            ))}
                          </div>
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
                [ NO HISTORICAL FKT PROGRESSION RECORDED ]
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}