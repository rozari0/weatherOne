import { NextRequest } from "next/server";
import { computeComfort } from "@/lib/comfort";

const cache = new Map<string, any>();
const OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5/forecast"; // 5 day / 3 hour forecast

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const location = (body.location || "").trim();
    const date = (body.date || "").trim(); // YYYY-MM-DD
    if (!location || !date) {
      return Response.json(
        { error: "location and date required" },
        { status: 400 }
      );
    }
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "OPENWEATHER_API_KEY not configured" },
        { status: 500 }
      );
    }
    const cacheKey = `${location.toLowerCase()}|${date}`;
    if (cache.has(cacheKey)) {
      return Response.json({ source: "cache", ...cache.get(cacheKey) });
    }

    const url = `${OPENWEATHER_BASE}?q=${encodeURIComponent(
      location
    )}&appid=${apiKey}&units=metric`;
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) {
      const text = await res.text();
      return Response.json({ error: `fetch failed: ${text}` }, { status: 502 });
    }
    const data = await res.json();
    if (!data.list) {
      return Response.json({ error: "unexpected response" }, { status: 502 });
    }
    const items = data.list.filter((item: any) => item.dt_txt.startsWith(date));
    if (!items.length) {
      return Response.json(
        { error: "date outside 5-day forecast window" },
        { status: 404 }
      );
    }
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const temps = items.map((i: any) => i.main.temp as number);
    const hums = items.map((i: any) => i.main.humidity as number);
    const winds = items.map((i: any) => i.wind.speed as number);
    const firstWeather = items[0].weather?.[0];
    const description = firstWeather?.description || "n/a";
    const icon = firstWeather?.icon;
    const condensed = {
      date,
      avgTemp: Number(avg(temps).toFixed(2)),
      avgHumidity: Number(avg(hums).toFixed(2)),
      avgWind: Number(avg(winds).toFixed(2)),
      description,
      icon,
    };
    const comfort = computeComfort({
      temperature: condensed.avgTemp,
      humidity: condensed.avgHumidity,
      windSpeed: condensed.avgWind,
      description: condensed.description,
    });
    const payload = {
      location: data.city?.name || location,
      condensed,
      comfort,
      raw: items,
    };
    cache.set(cacheKey, payload);
    return Response.json({ source: "live", ...payload });
  } catch (e: any) {
    return Response.json(
      { error: e?.message || "unknown error" },
      { status: 500 }
    );
  }
}
