"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Route } from "@/types";
import { CheckCircle2, UploadCloud, Loader2 } from "lucide-react";

export default function SubmitEffortPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form State
  const [athleteName, setAthleteName] = useState("");
  const [routeId, setRouteId] = useState("");
  const [date, setDate] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [gpxFile, setGpxFile] = useState<File | null>(null);

  // Fetch routes for the dropdown on mount
  useEffect(() => {
    async function fetchRoutes() {
      const { data, error } = await supabase.from("routes").select("*").order("name");
      if (data) setRoutes(data);
      if (error) console.error("Error fetching routes:", error);
    }
    fetchRoutes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setToast(null);

    try {
      if (!gpxFile) throw new Error("Please upload a GPX file.");
      if (!routeId) throw new Error("Please select a route.");
      if (!athleteName) throw new Error("Please enter your name.");

      // 1. Calculate time
      const hrs = parseInt(hours || "0", 10);
      const mins = parseInt(minutes || "0", 10);
      const secs = parseInt(seconds || "0", 10);
      const totalSeconds = hrs * 3600 + mins * 60 + secs;
      
      const formattedTime = [
        hrs > 0 ? hrs.toString() : null,
        hrs > 0 ? mins.toString().padStart(2, "0") : mins.toString(),
        secs.toString().padStart(2, "0"),
      ].filter(Boolean).join(":");

      // 2. Upload GPX File to Supabase Storage
      const fileExt = gpxFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("gpx-files")
        .upload(filePath, gpxFile);

      if (uploadError) throw new Error("Failed to upload GPX file.");

      const { data: { publicUrl } } = supabase.storage
        .from("gpx-files")
        .getPublicUrl(filePath);

      // 3. Find or Create Athlete
      let athleteId = "";
      const { data: existingAthlete, error: athleteLookupError } = await supabase
        .from("athletes")
        .select("id")
        .ilike("name", athleteName)
        .maybeSingle();

      if (existingAthlete) {
        athleteId = existingAthlete.id;
      } else {
        const { data: newAthlete, error: createAthleteError } = await supabase
          .from("athletes")
          .insert({ name: athleteName })
          .select("id")
          .single();
          
        if (createAthleteError) throw new Error("Failed to create athlete record.");
        athleteId = newAthlete.id;
      }

      // 4. Insert Effort
      const { error: effortError } = await supabase.from("efforts").insert({
        route_id: routeId,
        athlete_id: athleteId,
        time_seconds: totalSeconds,
        formatted_time: formattedTime,
        activity_date: date,
        gpx_url: publicUrl,
        verified: false, // Default to unverified pending admin approval
      });

      if (effortError) throw new Error("Failed to submit effort.");

      // Success Reset
      setToast({ message: "Effort submitted successfully! Pending verification.", type: "success" });
      setAthleteName("");
      setRouteId("");
      setDate("");
      setHours("");
      setMinutes("");
      setSeconds("");
      setGpxFile(null);
      
    } catch (error: any) {
      setToast({ message: error.message || "An unexpected error occurred.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Submit a Time</h1>
          <p className="text-gray-500 mt-2">Upload your GPX file to claim your spot on the leaderboard.</p>
        </div>

        {toast && (
          <div className={`mb-6 p-4 rounded-md flex items-center gap-3 ${toast.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            {toast.type === "success" ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : null}
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Athlete Name */}
          <div>
            <label htmlFor="athleteName" className="block text-sm font-medium text-gray-700">Athlete Name</label>
            <input
              type="text"
              id="athleteName"
              required
              value={athleteName}
              onChange={(e) => setAthleteName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
              placeholder="e.g. Anton Krupicka"
            />
          </div>

          {/* Route Selection */}
          <div>
            <label htmlFor="route" className="block text-sm font-medium text-gray-700">Select Route</label>
            <select
              id="route"
              required
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border bg-white"
            >
              <option value="" disabled>Choose a Flatiron route...</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Completion Date</label>
            <input
              type="date"
              id="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
            />
          </div>

          {/* Elapsed Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Elapsed Time</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <input
                  type="number"
                  min="0"
                  placeholder="HH"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="MM"
                  required
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="SS"
                  required
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                />
              </div>
            </div>
          </div>

          {/* GPX File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GPX Track</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors relative">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="gpx-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    <span>Upload a file</span>
                    <input
                      id="gpx-upload"
                      name="gpx-upload"
                      type="file"
                      accept=".gpx"
                      className="sr-only"
                      onChange={(e) => setGpxFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">.GPX up to 10MB</p>
              </div>
            </div>
            {gpxFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: <span className="font-medium text-gray-900">{gpxFile.name}</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Submitting...
              </>
            ) : (
              "Submit FKT"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}