import * as fs from 'fs';
import * as path from 'path';
import { Trophy, Clock, Zap, CheckCircle2 } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  athleteName: string;
  activityId: string;
  elapsedTimeSeconds: number;
  avgSpeedKmh: number;
  elevationGainMeters: number;
  verifiedAt: string;
}

interface LeaderboardData {
  routeId: string;
  lastUpdated: string;
  leaderboard: LeaderboardEntry[];
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default async function VerifiedLeaderboard({ routeId }: { routeId: string }) {
  const filePath = path.join(process.cwd(), 'data', 'leaderboards', `${routeId}.json`);

  let leaderboardData: LeaderboardData | null = null;
  if (fs.existsSync(filePath)) {
    leaderboardData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  const entries = leaderboardData?.leaderboard || [];

  return (
    <div className="bg-sandstone-900 border-2 border-sandstone-800 p-6 shadow-2xl font-serif space-y-4">
      <div className="flex items-center justify-between border-b border-sandstone-800 pb-3">
        <h3 className="text-xl font-bold text-sandstone-100 flex items-center gap-2">
          <Trophy size={20} className="text-flatiron-gold" /> Auto-Verified Strava Leaderboard
        </h3>
        {leaderboardData && (
          <span className="font-mono text-[10px] text-sandstone-400">
            LAST SYNC: {new Date(leaderboardData.lastUpdated).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs text-sandstone-200">
          <thead className="bg-sandstone-950 text-flatiron-ochre uppercase border-b border-sandstone-800">
            <tr>
              <th className="px-4 py-3">RANK</th>
              <th className="px-4 py-3">ATHLETE</th>
              <th className="px-4 py-3">TIME</th>
              <th className="px-4 py-3">AVG SPEED</th>
              <th className="px-4 py-3">ELEV GAIN</th>
              <th className="px-4 py-3 text-right">VERIFIED</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sandstone-800">
            {entries.length > 0 ? (
              entries.map((entry) => (
                <tr key={entry.activityId} className="hover:bg-sandstone-800/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-flatiron-gold">
                    {entry.rank === 1 ? '01 👑' : `#0${entry.rank}`}
                  </td>
                  <td className="px-4 py-3 font-serif text-sm font-bold text-sandstone-100">
                    <a
                      href={`https://www.strava.com/activities/${entry.activityId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-flatiron-red underline decoration-sandstone-700 underline-offset-2"
                    >
                      {entry.athleteName}
                    </a>
                  </td>
                  <td className="px-4 py-3 font-bold text-flatiron-red flex items-center gap-1">
                    <Clock size={13} /> {formatDuration(entry.elapsedTimeSeconds)}
                  </td>
                  <td className="px-4 py-3">{entry.avgSpeedKmh} km/h</td>
                  <td className="px-4 py-3">{entry.elevationGainMeters}m</td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                      <CheckCircle2 size={12} /> VERIFIED
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sandstone-400 font-mono">
                  [ NO AUTO-VERIFIED EFFORTS FOUND — RUN `npm run sync-leaderboards` ]
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}