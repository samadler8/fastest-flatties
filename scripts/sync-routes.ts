import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client (using your service role key to bypass RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncRouteInfo(routeSlug: string) {
  console.log(`Syncing files for route: ${routeSlug}...`);

  // 1. Read the local files
  const routeDir = path.join(process.cwd(), 'data', 'routes', routeSlug);
  const rulesPath = path.join(routeDir, 'rules.md');
  const mapPath = path.join(routeDir, 'map.geojson');

  if (!fs.existsSync(rulesPath) || !fs.existsSync(mapPath)) {
    console.error(`Missing markdown or geojson for ${routeSlug}`);
    return;
  }

  const rulesMarkdown = fs.readFileSync(rulesPath, 'utf8');
  const rulesGeojson = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

  // 2. Update Supabase
  const { error } = await supabase
    .from('routes')
    .update({ 
      rules_markdown: rulesMarkdown, 
      rules_geojson: rulesGeojson 
    })
    .eq('slug', routeSlug); // Assuming you have a 'slug' column (e.g., 'def'). Use 'id' if not.

  if (error) {
    console.error(`Error updating DB for ${routeSlug}:`, error);
  } else {
    console.log(`Successfully synced ${routeSlug} to Supabase!`);
  }
}

syncRouteInfo('def');