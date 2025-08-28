"use client";
import React from "react";
import { ComfortBadge } from "./ComfortBadge";
import { computeComfort, ComfortResult } from "@/lib/comfort";
import { cn } from "@/lib/utils";

export interface CondensedForecastItem {
  date: string; // YYYY-MM-DD
  avgTemp: number;
  avgHumidity: number;
  avgWind: number;
  description: string;
  icon?: string; // openweather icon id
}

export interface WeatherCardProps {
  location: string;
  forecast: CondensedForecastItem | null;
  rawItems?: any[]; // raw list for the date (optional)
  className?: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  location,
  forecast,
  className,
}) => {
  let comfort: ComfortResult | null = null;
  if (forecast) {
    comfort = computeComfort({
      temperature: forecast.avgTemp,
      humidity: forecast.avgHumidity,
      windSpeed: forecast.avgWind,
      description: forecast.description,
    });
  }

  return (
    <div
      className={cn(
        "w-full max-w-xl rounded-lg border-2 border-black p-5 shadow-md bg-card text-card-foreground flex flex-col gap-4",
        className
      )}
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="font-bold text-xl font-sans tracking-tight">
          {location || "—"}
        </h2>
        {comfort && <ComfortBadge {...comfort} />}
      </header>
      {!forecast && (
        <p className="text-sm text-muted-foreground">
          Enter a location & date within the next 5 days to view forecast.
        </p>
      )}
      {forecast && (
        <div className="grid grid-cols-2 gap-4 text-sm font-mono">
          <Stat label="Date" value={forecast.date} />
          <Stat label="Avg Temp" value={`${forecast.avgTemp.toFixed(1)}°C`} />
          <Stat
            label="Humidity"
            value={`${forecast.avgHumidity.toFixed(0)}%`}
          />
          <Stat label="Wind" value={`${forecast.avgWind.toFixed(1)} m/s`} />
          <div className="col-span-2 flex items-center gap-2">
            {forecast.icon && (
              // openweather icon
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`https://openweathermap.org/img/wn/${forecast.icon}@2x.png`}
                alt={forecast.description}
                className="h-10 w-10"
                loading="lazy"
              />
            )}
            <p className="capitalize">{forecast.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
    <span className="text-base font-semibold">{value}</span>
  </div>
);
