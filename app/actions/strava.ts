"use server";

import { fetchActivityStreams } from "@/lib/strava/scraper";

// Helper to calculate distance between two coordinates in meters (Haversine)
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth's radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Removed the stravaCookie parameter since we can pull it securely from env vars on the server
export async function processStravaActivity(url: string, availableRoutes: any[]) {
  try {
    const stravaCookie = process.env.STRAVA_COOKIE;
    if (!stravaCookie) {
      throw new Error("Strava authentication cookie is not configured on the server.");
    }

    const match = url.match(/(?:activities\/|activity\/)(\d+)/);
    if (!match || !match[1]) throw new Error("Invalid Strava activity URL");
    const activityId = match[1];

    // 1. Add the Cookie header to the HTML fetch
    const pageRes = await fetch(`https://www.strava.com/activities/${activityId}`, {
      headers: { 
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Cookie": stravaCookie 
      }
    });
    const html = await pageRes.text();

    let athleteName = "Unknown Athlete";
    let activityTitle = "Strava Activity";
    
    // Strava's og:title usually looks like "Activity Name - Athlete Name | Strava"
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
    if (titleMatch && titleMatch[1]) {
      const parts = titleMatch[1].split(' - ');
      if (parts.length >= 2) {
        activityTitle = parts[0].trim();
        athleteName = parts[1].split('|')[0].trim();
      }
    }

    // 2. Fetch Streams using the merged function
    const streams = await fetchActivityStreams(activityId, stravaCookie);
    
    const elapsedSeconds = streams.time[streams.time.length - 1] - streams.time[0];
    const startCoord = streams.latlng[0];
    const endCoord = streams.latlng[streams.latlng.length - 1];

    // 3. Auto-Match Route (Requires your available routes to have start/end lat/lng in DB)
    let detectedRouteId = null;
    const TOLERANCE_METERS = 200; // Allow 200m buffer for GPS drift at trailheads

    for (const route of availableRoutes) {
      if (!route.startLat) continue; 
      
      const startDist = getDistanceFromLatLonInM(startCoord[0], startCoord[1], route.startLat, route.startLng);
      const endDist = getDistanceFromLatLonInM(endCoord[0], endCoord[1], route.endLat, route.endLng);
      
      if (startDist <= TOLERANCE_METERS && endDist <= TOLERANCE_METERS) {
        detectedRouteId = route.id;
        break;
      }
    }

    // 4. Generate GPX
    let gpxData = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1">\n<trk>\n<trkseg>\n`;
    for (let i = 0; i < streams.latlng.length; i++) {
      gpxData += `<trkpt lat="${streams.latlng[i][0]}" lon="${streams.latlng[i][1]}"><ele>${streams.altitude[i] || 0}</ele></trkpt>\n`;
    }
    gpxData += `</trkseg>\n</trk>\n</gpx>`;

    return {
      success: true,
      activityId,
      athleteName,
      activityTitle,
      elapsedSeconds,
      gpxData,
      detectedRouteId
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}