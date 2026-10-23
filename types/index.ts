export interface Athlete {
  id: string; // UUID
  name: string;
  instagram: string | null;
  created_at: string; // TIMESTAMPTZ (ISO string)
}

export interface Route {
  id: string; // UUID
  name: string;
  description: string | null;
  distance_miles: number | null;
  elevation_gain_ft: number | null;
  gpx_url: string | null;
  created_at: string; // TIMESTAMPTZ (ISO string)
}

export interface Effort {
  id: string; // UUID
  route_id: string; // UUID (Foreign Key)
  athlete_id: string; // UUID (Foreign Key)
  time_seconds: number;
  formatted_time: string;
  activity_date: string; // DATE (YYYY-MM-DD)
  gpx_url: string | null;
  verified: boolean;
  created_at: string; // TIMESTAMPTZ (ISO string)
}

// Helper type for joining Efforts with their related Athlete and Route data
export interface PopulatedEffort extends Effort {
  athlete?: Athlete;
  route?: Route;
}