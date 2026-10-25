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

/** Strava currently often uses "Activity title - Athlete | Strava" for og:title. */
export function parseStravaMetadata(html: string): StravaActivityMetadata {
  const rawTitle = getMeta(html, "og:title");
  if (!rawTitle) {
    throw new Error("Strava did not provide an activity title (og:title).");
  }

  const withoutBrand = rawTitle.replace(/\s*[|]\s*Strava\s*$/i, "").trim();
  const separator = withoutBrand.lastIndexOf(" - ");
  const activityTitle = separator >= 0 ? withoutBrand.slice(0, separator).trim() : withoutBrand;
  const athleteName = separator >= 0
    ? withoutBrand.slice(separator + 3).trim()
    : (getMeta(html, "author") ?? "");

  if (!athleteName || !activityTitle) {
    throw new Error(
      "Could not reliably determine the athlete's name from Strava. No activity was archived."
    );
  }
  return { athleteName, activityTitle };
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
