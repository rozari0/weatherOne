"use client";
import React, { useState } from "react";
import { Button } from "@/components/retroui/Button";
import { WeatherCard } from "@/components/retroui/WeatherCard";
import { CalendarPicker } from "@/components/retroui/CalendarPicker";

interface WeatherResponse {
  location: string;
  condensed: {
    date: string;
    avgTemp: number;
    avgHumidity: number;
    avgWind: number;
    description: string;
    icon?: string;
    minTemp?: number;
    maxTemp?: number;
  };
  comfort: {
    score: number;
    level: number;
    label: string;
    explanation: string;
  };
  source: string;
  error?: string;
  plan?: string;
  suitable?: boolean;
  suggestions?: string;
  assessment?: string;
  displayDate?: string;
  planReason?: string;
}

export default function WeatherPage() {
  const today = new Date();
  const todayStrISO = today.toISOString().slice(0, 10);
  const todayStr = (() => {
    const [y, m, d] = todayStrISO.split("-");
    return `${d}-${m}-${y}`;
  })();
  const [location, setLocation] = useState("New York");
  const [date, setDate] = useState(todayStr); // DD-MM-YYYY
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apod, setApod] = useState<any>(null);
  const [plan, setPlan] = useState("");

  async function fetchWeather(ev?: React.FormEvent) {
    ev?.preventDefault();
    if (!location || !date) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, date, plan: plan || undefined }),
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
      // Convert DD-MM-YYYY to ISO for APOD
      let isoDate = date;
      const m = date.match(/^(\d{2})-(\d{2})-(\d{4})$/);
      if (m) isoDate = `${m[3]}-${m[2]}-${m[1]}`;
      const apodRes = await fetch(`/api/apod?date=${isoDate}`);
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
            Weather One
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
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono uppercase tracking-wide">
              Date
            </label>
            <CalendarPicker value={date} onChange={setDate} daysForward={4} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono uppercase tracking-wide">
              Optional Plan / Activity
            </label>
            <textarea
              className="rounded-md border-2 border-black px-3 py-2 font-mono text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-y min-h-20"
              placeholder="e.g. Outdoor picnic with friends"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              maxLength={300}
            />
            <span className="text-[10px] text-muted-foreground font-mono self-end">
              {plan.length}/300
            </span>
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
          assessment={data?.assessment}
          displayDate={data?.displayDate || date}
        />
        {data?.plan && (
          <div className="w-full max-w-xl rounded-lg border-2 border-black p-4 shadow bg-card flex flex-col gap-3">
            <h3 className="text-lg font-semibold">Plan Assessment</h3>
            <p
              className={`text-sm font-mono rounded-md border-2 border-black px-3 py-2 ${
                data.suitable
                  ? "bg-primary text-primary-foreground"
                  : "bg-destructive text-destructive-foreground"
              }`}
            >
              {data.suitable
                ? `Suitable: "${data.plan}"`
                : `Not ideal: "${data.plan}"`}
            </p>
            {data.planReason && (
              <p className="text-xs font-mono bg-muted/30 border-2 border-black rounded-md px-3 py-2 whitespace-pre-wrap">
                {data.planReason}
              </p>
            )}
            <div>
              <h4 className="text-xs uppercase font-mono tracking-wide mb-1">
                Suggestions / Alternatives
              </h4>
              <div className="whitespace-pre-wrap text-sm font-mono bg-muted/30 border-2 border-black rounded-md p-3 max-h-80 overflow-auto">
                {data.suggestions || "(No suggestions generated)"}
              </div>
            </div>
          </div>
        )}
        {apod?.title && (
          <div className="text-xs text-muted-foreground font-mono">
            APOD: {apod.title}
          </div>
        )}
      </div>
    </div>
  );
}
