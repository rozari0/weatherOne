// Utility to compute a simple "comfort level" score & label from weather data.
// Inputs use metric units (Celsius, m/s, % humidity).

export interface ComfortInput {
  temperature: number; // Celsius
  humidity: number; // %
  windSpeed: number; // m/s
  description?: string; // lowercase short description (e.g. light rain)
}

export interface ComfortResult {
  score: number; // raw score
  level: number; // 1-5 bucket
  label: string;
  explanation: string;
  color: string; // tailwind text/bg helper color (without bg-/text- prefixes)
}

export function computeComfort(input: ComfortInput): ComfortResult {
  const { temperature: t, humidity: h, windSpeed: w, description = "" } = input;
  let score = 0;

  // Temperature bands (ideal ~22C)
  if (t >= 20 && t <= 24) score += 3;
  else if (t >= 15 && t <= 29) score += 2;
  else if (t >= 10 && t <= 34) score += 1;
  else if (t < 0 || t > 38) score -= 1; // extreme discomfort

  // Humidity bands
  if (h >= 30 && h <= 55) score += 2;
  else if (h >= 20 && h <= 65) score += 1;
  else if (h > 85 || h < 15) score -= 1;

  // Wind (gentle breeze is nice, strong winds reduce comfort)
  if (w >= 0.5 && w <= 4) score += 1;
  else if (w > 8 && w <= 12) score -= 0.5;
  else if (w > 12) score -= 1;

  // Precipitation / adverse conditions
  if (/rain|snow|storm|thunder|drizzle|sleet|hail/.test(description)) {
    score -= 1;
  } else if (/clear|sun/.test(description)) {
    score += 0.5;
  }

  // Normalize & bucket
  const clamped = Math.max(-2, Math.min(6, score));
  let level = 1;
  if (clamped > 4.5) level = 5;
  else if (clamped > 3) level = 4;
  else if (clamped > 1.5) level = 3;
  else if (clamped > 0) level = 2;

  const labelMap: Record<
    number,
    { label: string; color: string; explanation: string }
  > = {
    1: {
      label: "Very Uncomfortable",
      color: "destructive",
      explanation: "Extreme temps / humidity / conditions create low comfort.",
    },
    2: {
      label: "Uncomfortable",
      color: "accent",
      explanation: "Outside ideal ranges; plan accordingly.",
    },
    3: {
      label: "Moderate",
      color: "muted",
      explanation: "Acceptable but not ideal; minor adjustments recommended.",
    },
    4: {
      label: "Comfortable",
      color: "primary",
      explanation: "Good outdoor conditions for most activities.",
    },
    5: {
      label: "Ideal",
      color: "primary",
      explanation: "Near-optimal mix of temperature, humidity & wind.",
    },
  };

  const { label, color, explanation } = labelMap[level];
  return {
    score: Number(clamped.toFixed(2)),
    level,
    label,
    color,
    explanation,
  };
}
