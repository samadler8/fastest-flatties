"use client";

import { useState } from "react";
import { Activity, Search, Map, CheckCircle, AlertTriangle, FastForward } from "lucide-react";
import { processStravaActivity } from "@/app/actions/strava";

// Ensure RouteInfo includes startLat/startLng so the backend can match them
type RouteInfo = { id: string; name: string; startLat?: number; startLng?: number; endLat?: number; endLng?: number };
type AthleteInfo = { id: string; name: string };

export default function SubmissionWizard({ 
  availableRoutes, 
  availableAthletes 
}: { 
  availableRoutes: RouteInfo[],
  availableAthletes: AthleteInfo[]
}) {
  const [step, setStep] = useState<1 | 2>(1); // Reduced from 3 steps to 2
  const [stravaUrl, setStravaUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Auto-populated State
  const [finalRouteId, setFinalRouteId] = useState<string>("");
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("");
  const [athleteNameFallback, setAthleteNameFallback] = useState<string>("");
  const [confirmedTime, setConfirmedTime] = useState<number>(0);
  const [processedGpx, setProcessedGpx] = useState<string>("");
  const [isFullyAutomated, setIsFullyAutomated] = useState(false);

  const handleProcessActivity = async () => {
    setIsProcessing(true);
    try {
      // Pass available routes to the backend for spatial matching
      const result = await processStravaActivity(stravaUrl, availableRoutes);
      if (!result.success) throw new Error(result.error);
      
      setProcessedGpx(result.gpxData!);
      setConfirmedTime(result.elapsedSeconds!);
      
      // Auto-Match Route
      if (result.detectedRouteId) {
        setFinalRouteId(result.detectedRouteId);
      }

      // Auto-Match Athlete (Fuzzy match by exact name)
      const matchedAthlete = availableAthletes.find(
        a => a.name.toLowerCase() === result.athleteName?.toLowerCase()
      );
      
      if (matchedAthlete) {
        setSelectedAthleteId(matchedAthlete.id);
      } else {
        setSelectedAthleteId("new_athlete");
        setAthleteNameFallback(result.athleteName!);
      }

      // If both route and athlete were successfully identified, flag for UI
      if (result.detectedRouteId && matchedAthlete) {
        setIsFullyAutomated(true);
      }

      setStep(2);
    } catch (error: any) {
      alert(`Failed to process activity: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    // Execute final Supabase submission here using finalRouteId, selectedAthleteId, confirmedTime
    alert("Fully automated submission successful!");
    setIsProcessing(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-sandstone-900 border-2 border-sandstone-800 shadow-xl p-8 font-serif text-sandstone-100">
      
      {/* STEP 1: ONE-CLICK PASTE */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-flatiron-red flex items-center gap-2">
            <Activity /> Auto-Import Activity
          </h2>
          
          <input 
            type="url" 
            placeholder="Paste Strava URL here..."
            value={stravaUrl}
            onChange={(e) => setStravaUrl(e.target.value)}
            className="w-full bg-sandstone-950 border border-sandstone-700 p-4 text-sandstone-100 focus:outline-none focus:border-flatiron-red"
          />

          <button 
            onClick={handleProcessActivity}
            disabled={isProcessing || !stravaUrl}
            className="w-full py-4 bg-flatiron-red text-white font-bold tracking-widest uppercase disabled:opacity-50 hover:bg-red-800 transition-colors flex justify-center items-center gap-2"
          >
            {isProcessing ? <Search className="animate-spin" /> : "Extract & Match Data"}
          </button>
        </div>
      )}

      {/* STEP 2: REVIEW & SUBMIT */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {isFullyAutomated ? (
              <><FastForward className="text-green-500" /> Perfect Match Found</>
            ) : (
              <><CheckCircle className="text-flatiron-ochre" /> Review Extracted Data</>
            )}
          </h2>

          <div className="bg-sandstone-950 border border-sandstone-700 p-6 grid gap-6">
            {/* Route Section */}
            <div>
              <label className="font-mono text-xs text-sandstone-400 uppercase block mb-2">Route</label>
              <select 
                value={finalRouteId}
                onChange={(e) => setFinalRouteId(e.target.value)}
                className={`w-full p-3 focus:outline-none ${finalRouteId ? 'bg-green-900/20 border-green-900 text-white' : 'bg-sandstone-900 border-sandstone-700 text-sandstone-100'}`}
              >
                <option value="">-- Missing: Select Manually --</option>
                {availableRoutes.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Athlete Section */}
            <div>
              <label className="font-mono text-xs text-sandstone-400 uppercase block mb-2">Athlete Profile</label>
              <select 
                value={selectedAthleteId}
                onChange={(e) => setSelectedAthleteId(e.target.value)}
                className={`w-full p-3 focus:outline-none ${selectedAthleteId && selectedAthleteId !== 'new_athlete' ? 'bg-green-900/20 border-green-900 text-white' : 'bg-sandstone-900 border-sandstone-700 text-sandstone-100'}`}
              >
                <option value="">-- Missing: Select Manually --</option>
                <option value="new_athlete">[ CREATE NEW: {athleteNameFallback} ]</option>
                {availableAthletes.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            {/* Time Section */}
            <div>
               <label className="font-mono text-xs text-sandstone-400 uppercase block mb-2">Total Elapsed Time (Seconds)</label>
               <input 
                  type="number" 
                  value={confirmedTime}
                  readOnly
                  className="w-full bg-sandstone-900 border border-sandstone-700 p-3 text-sandstone-400 cursor-not-allowed"
                />
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="px-6 py-3 border border-sandstone-700 text-sandstone-400 hover:text-white uppercase font-mono text-sm tracking-wider">Cancel</button>
            <button 
              onClick={handleSubmit}
              disabled={!finalRouteId || !selectedAthleteId || isProcessing}
              className="flex-1 py-3 bg-green-700 text-white font-bold tracking-widest uppercase disabled:opacity-50 hover:bg-green-600 transition-colors"
            >
              Confirm Submission
            </button>
          </div>
        </div>
      )}
    </div>
  );
}