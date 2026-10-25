import { supabase } from "@/lib/supabase";
import SubmissionWizard from "@/components/SubmissionWizard"; // Adjust this path based on where the file lives

export default async function SubmitEffortPage() {
  // Fetch the data the Wizard needs for its dropdowns
  const { data: routes } = await supabase.from("routes").select("id, name");
  const { data: athletes } = await supabase.from("athletes").select("id, name");

  return (
    <div className="min-h-screen bg-sandstone-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center mb-8">
        <h1 className="text-3xl font-bold text-sandstone-100 font-serif">Submit a Time</h1>
        <p className="text-sandstone-400 mt-2">Paste a Strava activity to archive its athlete name, ID and a sparse GPS track. This does not verify an FKT.</p>
      </div>

      {/* Render your Strava Wizard component here */}
      <SubmissionWizard 
        availableRoutes={routes || []} 
        availableAthletes={athletes || []} 
      />
    </div>
  );
}
