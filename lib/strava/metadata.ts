export interface StravaActivityMetadata {
  athleteName: string;
  activityTitle: string;
}

function decodeEntities(text: string): string {
  const named: Record<string, string> = {
    amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " ",
  };
  return text.replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (entity, code: string) => {
    if (code.startsWith("#")) {
      const numeric = code[1].toLowerCase() === "x"
        ? Number.parseInt(code.slice(2), 16)
        : Number.parseInt(code.slice(1), 10);
      return numeric > 0 && numeric <= 0x10ffff ? String.fromCodePoint(numeric) : entity;
    }
    return named[code.toLowerCase()] ?? entity;
  });
}

function getMeta(html: string, property: string): string | undefined {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs: Record<string, string> = {};
    for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)) {
      attrs[match[1].toLowerCase()] = match[3];
    }
    if ((attrs.property ?? attrs.name)?.toLowerCase() === property.toLowerCase()) {
      return attrs.content ? decodeEntities(attrs.content).trim() : undefined;
    }
  }
  return undefined;
}

function documentTitle(html: string): string | undefined {
  const raw = html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1];
  return raw ? decodeEntities(raw).replace(/\s+/g, " ").trim() : undefined;
}

/**
 * Strava now sometimes renders titles like "DEF | Run | Strava" with no og:title.
 * In this format "Run" is an activity type, NOT an athlete's name.
 */
function parseTitle(raw: string): { activityTitle: string; athleteName?: string } {
  const unbranded = raw.replace(/\s*\|\s*Strava\s*$/i, "").trim();
  const activityKinds = /\s+\|\s+(?:Run|Ride|Walk|Hike|Swim|Workout|Virtual Ride|Virtual Run|Weight Training|Trail Run|Alpine Ski|Nordic Ski|Backcountry Ski|Snowboard|Yoga|Rowing|Kayaking|Cycling|E-Bike Ride)\s*$/i;
  const typeStripped = unbranded.replace(activityKinds, "").trim();
  if (typeStripped !== unbranded) return { activityTitle: typeStripped };

  // Existing Strava/OpenGraph convention: "Activity name - Athlete Name | Strava".
  const separator = unbranded.lastIndexOf(" - ");
  if (separator < 0) return { activityTitle: unbranded };
  return {
    activityTitle: unbranded.slice(0, separator).trim(),
    athleteName: unbranded.slice(separator + 3).trim(),
  };
}

function validateAthleteName(name: string): string {
  const trimmed = name.replace(/\s+/g, " ").trim();
  if (!trimmed || trimmed.length > 120 || /[<>\r\n]/.test(name)) {
    throw new Error("Invalid athlete name. Please enter a name containing 1–120 characters.");
  }
  return trimmed;
}

/**
 * When Strava doesn't publish the athlete in its metadata, accept a separately
 * confirmed athlete name instead of guessing from a generic webpage title.
 */
export function parseStravaMetadata(html: string, confirmedAthleteName?: string): StravaActivityMetadata {
  const rawTitle = getMeta(html, "og:title") ?? documentTitle(html);
  if (!rawTitle) {
    throw new Error("Strava did not provide an activity title (og:title or HTML title).");
  }
  const parsed = parseTitle(rawTitle);
  const activityTitle = parsed.activityTitle;
  const athleteName = parsed.athleteName || getMeta(html, "author") || confirmedAthleteName?.trim() || "";
  if (!activityTitle) {
    throw new Error("Strava activity title was empty.");
  }
  if (!athleteName) {
    throw new Error("Strava provided the activity title but not the athlete name. Enter the athlete name in the optional field and retry.");
  }
  return { athleteName: validateAthleteName(athleteName), activityTitle };
}

export function parseStravaActivityId(rawUrl: string): string {
  let url: URL;
  try { url = new URL(rawUrl); }
  catch { throw new Error("Enter a full Strava activity URL."); }
  if (url.protocol !== "https:" || !["www.strava.com", "strava.com"].includes(url.hostname)) {
    throw new Error("Only HTTPS strava.com activity URLs are supported.");
  }
  const match = /^\/activities\/(\d+)\/?$/.exec(url.pathname);
  if (!match) throw new Error("Invalid Strava activity URL.");
  return match[1];
}
