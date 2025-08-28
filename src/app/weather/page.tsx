"use client";
import React, { useState } from "react";
import { Button } from "@/components/retroui/Button";
import { WeatherCard } from "@/components/retroui/WeatherCard";

interface WeatherResponse {
  location: string;
  condensed: {
    date: string;
    avgTemp: number;
    avgHumidity: number;
    avgWind: number;
    description: string;
    icon?: string;
  };
  comfort: {
    score: number;
    level: number;
    label: string;
    explanation: string;
  };
  source: string;
  error?: string;
}

export default function WeatherPage() {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const [location, setLocation] = useState("New York");
  const [date, setDate] = useState(todayStr);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apod, setApod] = useState<any>(null);

  async function fetchWeather(ev?: React.FormEvent) {
    ev?.preventDefault();
    if (!location || !date) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, date }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
    try {
      const apodRes = await fetch(`/api/apod?date=${date}`);
      const apodJson = await apodRes.json();
      setApod(apodJson);
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center gap-8 p-6 relative">
      {apod?.url && apod.media_type === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={apod.url}
          alt={apod.title || "APOD"}
          className="pointer-events-none select-none fixed inset-0 object-cover opacity-10"
        />
      )}
      <div className="z-10 w-full max-w-xl flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold font-sans tracking-tight">
            Retro Weather
          </h1>
          <p className="text-sm text-muted-foreground max-w-prose">
            Enter a city and choose a date (within the next 5 days) to view the
            aggregated forecast & a computed comfort level. Powered by
            OpenWeather + optional NASA APOD imagery.
          </p>
        </header>
        <form
          onSubmit={fetchWeather}
          className="flex flex-col gap-4 rounded-lg border-2 border-black p-4 shadow-md bg-card"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono uppercase tracking-wide">
              Location (city)
            </label>
            <input
              className="rounded-md border-2 border-black px-3 py-2 font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. London"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono uppercase tracking-wide">
              Date
            </label>
            <input
              type="date"
              className="rounded-md border-2 border-black px-3 py-2 font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              min={todayStr}
              max={new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 10)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Get Forecast"}
            </Button>
            {data?.source && (
              <span className="text-[10px] uppercase font-mono text-muted-foreground">
                {data.source === "cache" ? "Cached" : "Live"}
              </span>
            )}
          </div>
          {error && (
            <p className="text-destructive text-sm font-mono">{error}</p>
          )}
        </form>
        <WeatherCard
          location={data?.location || location}
          forecast={data?.condensed || null}
        />
        {apod?.title && (
          <div className="text-xs text-muted-foreground font-mono">
            APOD: {apod.title}
          </div>
        )}
      </div>
    </div>
  );
}
