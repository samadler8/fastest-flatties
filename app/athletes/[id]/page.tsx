import { supabase } from "@/lib/supabase";
import { Mountain, ArrowLeft, Trophy, Clock, Calendar, Download } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AthletePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  // 1. Fetch Athlete Details
  const { data: athlete, error: athleteError } = await supabase
    .from("athletes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (athleteError) {
    console.error("Athlete Query Error:", athleteError.message);
  }

  // 2. Fetch all verified efforts by this athlete with Route details
  const { data: efforts, error: effortError } = await supabase
    .from("efforts")
    .select("*, route:routes(*)")
    .eq("athlete_id", id)
    .eq("verified", true)
    .order("activity_date", { ascending: false });

  if (effortError) {
    console.error("Efforts Query Error:", effortError.message);
  }

  if (!athlete) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-bold text-slate-300">Athlete not found.</p>
        <p className="text-sm text-slate-500 font-mono">Query ID: {id}</p>
        <Link href="/" className="text-emerald-400 hover:underline text-sm">
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      {/* Header Bar */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors">
            <ArrowLeft size={16} className="mr-1.5" /> Back to Home
          </Link>
          <span className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
            <Mountain size={16} className="text-emerald-400" /> Boulder Flatirons
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Athlete Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Athlete Profile</span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1 mb-2">{athlete.name}</h1>
            {athlete.instagram && (
              <a 
                href={`https://instagram.com/${athlete.instagram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                {athlete.instagram}
              </a>
            )}
          </div>

          <div className="flex gap-4">
            <div className="bg-slate-950 border border-slate-800 px-5 py-3 rounded-xl text-center">
              <span className="block text-2xl font-black text-amber-400">{efforts?.length || 0}</span>
              <span className="text-xs text-slate-400 font-medium">Route Records</span>
            </div>
          </div>
        </div>

        {/* Effort History */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-amber-400" /> Recorded Route Efforts
          </h2>

          <div className="overflow-x-auto bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Route</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">GPX</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {efforts && efforts.length > 0 ? (
                  efforts.map((effort) => (
                    <tr key={effort.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">
                        <Link href={`/routes/${effort.route_id}`} className="hover:text-emerald-400 transition-colors">
                          {effort.route?.name || "Unknown Route"}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={14} /> {effort.formatted_time}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={14} /> {effort.activity_date}
                        </span>
                      </td>
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
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No verified efforts on record for this athlete.
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