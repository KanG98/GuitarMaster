import { NextRequest, NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  if (!YOUTUBE_API_KEY) {
    return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 });
  }

  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: "5",
    key: YOUTUBE_API_KEY,
  });

  const response = await fetch(`${YOUTUBE_SEARCH_URL}?${params}`);
  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: data.error?.message || "YouTube API error" },
      { status: response.status }
    );
  }

  const results = data.items.map((item: Record<string, unknown>) => ({
    videoId: (item.id as { videoId: string }).videoId,
    title: (item.snippet as { title: string }).title,
    channelTitle: (item.snippet as { channelTitle: string }).channelTitle,
    thumbnail: (item.snippet as { thumbnails: { default: { url: string } } }).thumbnails.default.url,
  }));

  return NextResponse.json({ results });
}
