import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || undefined; // YYYY-MM-DD
  const apiKey = process.env.NASA_API_KEY || "DEMO_KEY";
  const url = new URL("https://api.nasa.gov/planetary/apod");
  if (date) url.searchParams.set("date", date);
  url.searchParams.set("api_key", apiKey);
  try {
    const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (e: any) {
    return Response.json({ error: e?.message || "failed" }, { status: 500 });
  }
}
