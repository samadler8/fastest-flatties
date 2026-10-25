import { supabase } from "@/lib/supabase";
import { Mountain, MapPin, TrendingUp, Trophy, ArrowRight, UploadCloud } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch all routes from database
  const { data: routes } = await supabase
    .from("routes")
    .select("*, efforts(*, athlete:athletes(*))")
    .order("name", { ascending: true });

  return (
    <div className="min-h-screen bg-sandstone-950 text-sandstone-100 font-serif pb-20">
      {/* Header Bar */}
      <div className="border-b-2 border-flatiron-red/40 bg-sandstone-900/90 backdrop-blur-md sticky top-0 z-40 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-serif text-xl font-bold text-sandstone-100 flex items-center gap-2 tracking-tight">
            <Mountain size={22} className="text-flatiron-red" /> FASTEST FATTIES
          </span>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block font-mono text-xs text-flatiron-ochre uppercase tracking-widest border border-sandstone-800 bg-sandstone-950 px-3 py-1">
              Boulder Flatiron Records
            </span>
            <Link 
              href="/submit" 
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-flatiron-red text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-red-800 transition-colors border border-transparent hover:border-sandstone-400"
            >
              <UploadCloud size={14} />
              [ Submit Effort ]
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
        {/* Banner Hero */}
        <div className="bg-sandstone-900 border-2 border-sandstone-800 p-8 sm:p-12 shadow-2xl space-y-4 text-center sm:text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Mountain size={280} className="text-sandstone-100" />
          </div>

          <span className="font-mono text-xs text-flatiron-ochre uppercase tracking-widest block">
            EST. BOULDER, COLORADO — SPEED SCRAMBLING DIRECTORY
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-black text-sandstone-100 tracking-tight leading-none">
            Boulder Flatiron FKTs
          </h1>
          <p className="text-sandstone-200 text-lg leading-relaxed italic max-w-2xl font-serif">
            The definitive record system for classic Flatiron scrambles, linkups, and speed efforts across the Boulder Mountain Parks.
          </p>
        </div>

        {/* Route Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-6 border-b-2 border-sandstone-800 pb-2">
            <h2 className="text-2xl font-serif font-bold text-sandstone-100 flex items-center gap-2">
              <Trophy size={20} className="text-flatiron-gold" /> Official Flatiron Routes
            </h2>
            <span className="font-mono text-xs text-sandstone-400 uppercase">
              {routes?.length || 0} ROUTES LISTED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {routes && routes.length > 0 ? (
              routes.map((route) => {
                // Find fastest effort for route display card
                const verifiedEfforts = route.efforts?.filter((e: { verified: boolean }) => e.verified) || [];
                const fastestEffort = verifiedEfforts.sort((a: { time_seconds: number }, b: { time_seconds: number }) => a.time_seconds - b.time_seconds)[0];

                // Group athletes if FKT is held jointly
                const coHolders = fastestEffort 
                  ? verifiedEfforts.filter((e: { time_seconds: number; activity_date: string }) => e.time_seconds === fastestEffort.time_seconds && e.activity_date === fastestEffort.activity_date)
                  : [];

                const recordHolderName = coHolders.length > 0
                  ? coHolders.map((c: { athlete?: { name: string } }) => c.athlete?.name).filter(Boolean).join(" & ")
                  : "Unclaimed";

                return (
                  <div key={route.id} className="bg-sandstone-900 border-2 border-sandstone-800 shadow-2xl flex flex-col justify-between hover:border-flatiron-red/80 transition-colors group">
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-2xl font-serif font-bold text-sandstone-100 group-hover:text-flatiron-red transition-colors">
                          {route.name}
                        </h3>
                      </div>

                      <p className="text-sandstone-300 text-sm italic font-serif line-clamp-2">
                        "{route.description}"
                      </p>

                      <div className="flex flex-wrap gap-4 font-mono text-xs text-sandstone-300 bg-sandstone-950 border border-sandstone-800 p-3">
                        <span className="flex items-center gap-1.5 text-flatiron-ochre">
                          <MapPin size={14} /> <strong className="text-sandstone-100">{route.distance_miles} MILES</strong>
                        </span>
                        <span>|</span>
                        <span className="flex items-center gap-1.5 text-flatiron-ochre">
                          <TrendingUp size={14} /> <strong className="text-sandstone-100">{route.elevation_gain_ft} FT GAIN</strong>
                        </span>
                      </div>

                      <div className="bg-sandstone-950/80 border border-sandstone-800 p-4 space-y-1">
                        <span className="font-mono text-[10px] uppercase text-sandstone-400 block tracking-widest">
                          CURRENT RECORD HOLDER
                        </span>
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className="font-serif font-bold text-sandstone-100 text-sm">
                            {recordHolderName}
                          </span>
                          <span className="font-bold text-flatiron-red">
                            {fastestEffort ? fastestEffort.formatted_time : "--:--:--"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t-2 border-sandstone-800 bg-sandstone-950/50 px-6 py-3">
                      <Link 
                        href={`/routes/${route.id}`} 
                        className="inline-flex items-center justify-between w-full font-mono text-xs text-sandstone-300 hover:text-flatiron-red transition-colors uppercase font-bold"
                      >
                        <span>[ View Leaderboard & Route Map ]</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 bg-sandstone-900 border-2 border-sandstone-800 p-12 text-center font-mono text-xs text-sandstone-400">
                [ NO ROUTES POPULATED IN DATABASE YET ]
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}