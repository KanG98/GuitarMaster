export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

export async function searchYouTube(query: string): Promise<YouTubeSearchResult[]> {
  const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    if (res.status === 403) {
      throw new Error("YouTube API quota exceeded. Try again tomorrow or paste a URL directly.");
    }
    throw new Error("YouTube search failed");
  }
  const data = await res.json();
  return data.results;
}

export function extractVideoId(input: string): string | null {
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) {
    return input.trim();
  }

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export function buildGuitarTabQuery(songName: string, artist: string): string {
  return [songName, artist, "official video"].filter(Boolean).join(" ");
}
