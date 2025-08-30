import { NextRequest } from "next/server";
import { computeComfort } from "@/lib/comfort";
const OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5/forecast"; // 5 day / 3 hour forecast

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const location = (body.location || "").trim();
    const rawDate = (body.date || "").trim(); // could be DD-MM-YYYY or YYYY-MM-DD
    // Normalize date to YYYY-MM-DD
    let date = rawDate;
    const ddmmyyyy = /^(\d{2})-(\d{2})-(\d{4})$/;
    const yyyymmdd = /^(\d{4})-(\d{2})-(\d{2})$/;
    if (ddmmyyyy.test(rawDate)) {
      const [, d, m, y] = rawDate.match(ddmmyyyy)!;
      date = `${y}-${m}-${d}`;
    } else if (!yyyymmdd.test(rawDate)) {
      return Response.json(
        { error: "date must be DD-MM-YYYY" },
        { status: 400 }
      );
    }
    const plan: string | undefined = body.plan
      ? String(body.plan).trim()
      : undefined;
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
    const url = `${OPENWEATHER_BASE}?q=${encodeURIComponent(
      location
    )}&appid=${apiKey}&units=metric`;
    const res = await fetch(url, { cache: "no-store" });
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
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
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
      minTemp: Number(minTemp.toFixed(2)),
      maxTemp: Number(maxTemp.toFixed(2)),
    };
    const comfort = computeComfort({
      temperature: condensed.avgTemp,
      humidity: condensed.avgHumidity,
      windSpeed: condensed.avgWind,
      description: condensed.description,
    });
    // Gemini-generated assessment (fallback to heuristic if Gemini not set / fails)
    let assessment: string;
    const geminiKeyAssess = process.env.GEMINI_API_KEY;
    const heuristicAssessment = () => {
      const conditionsQualifier = /rain|storm|thunder/.test(description)
        ? "rainy"
        : /snow/.test(description)
        ? "snowy"
        : /cloud/.test(description)
        ? "cloudy"
        : /clear/.test(description)
        ? "clear"
        : description.split(" ")[0];
      return `Expect a ${conditionsQualifier} day with an average temperature near ${condensed.avgTemp.toFixed(
        1
      )}°C (range ${condensed.minTemp.toFixed(
        1
      )}°C – ${condensed.maxTemp.toFixed(
        1
      )}°C), humidity around ${condensed.avgHumidity.toFixed(
        0
      )}% and winds near ${condensed.avgWind.toFixed(1)} m/s. Comfort level ${
        comfort.level
      }/5 (${comfort.label}).`;
    };
    if (geminiKeyAssess) {
      try {
        const promptAssessment = `Provide a concise, friendly single-paragraph weather assessment (<=45 words) with a retro terminal vibe. Data: description=${description}; avgTemp=${condensed.avgTemp}C; minTemp=${condensed.minTemp}C; maxTemp=${condensed.maxTemp}C; humidity=${condensed.avgHumidity}%; wind=${condensed.avgWind} m/s; comfortLevel=${comfort.level} (${comfort.label}). Plain text only.`;
        const aRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKeyAssess}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptAssessment }] }],
              generationConfig: { temperature: 0.65, maxOutputTokens: 110 },
            }),
          }
        );
        if (aRes.ok) {
          const aj = await aRes.json();
          assessment = (aj.candidates?.[0]?.content?.parts || [])
            .map((p: any) => p.text)
            .join(" ")
            .trim();
          if (!assessment) assessment = heuristicAssessment();
        } else {
          assessment = heuristicAssessment();
        }
      } catch {
        assessment = heuristicAssessment();
      }
    } else {
      assessment = heuristicAssessment();
    }
    let suggestions: string | undefined;
    let suitable: boolean | undefined;
    let planReason: string | undefined;
    if (plan) {
      const geminiKey = process.env.GEMINI_API_KEY;
      if (geminiKey) {
        try {
          const planPrompt = `You are a weather-aware activity planner. Evaluate the user's plan for the given forecast and ALWAYS return JSON ONLY (no prose outside JSON).\n\nPlan: "${plan}"\nLocation: ${location}\nDate: ${date}\nWeather: description=${condensed.description}; avgTemp=${condensed.avgTemp}C; minTemp=${condensed.minTemp}C; maxTemp=${condensed.maxTemp}C; humidity=${condensed.avgHumidity}%; wind=${condensed.avgWind} m/s; comfortLevel=${comfort.level} (${comfort.label})\n\nTask: 1) Decide if the plan is suitable given conditions (true/false). Consider precipitation, extremes, wind, humidity, temperature range. 2) Provide a concise reason (<=30 words). 3) Provide 4-6 bullet suggestion strings: if suitable, offer enhancements & backups; if not suitable, offer safe/appealing alternatives with adaptation tips. Each suggestion: 'Activity – Rationale – Weather tip'. 4) JSON schema: {"suitable":boolean,"reason":string,"suggestions":string[]}\nReturn ONLY JSON.`;
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: planPrompt }] }],
                generationConfig: { temperature: 0.6, maxOutputTokens: 300 },
              }),
            }
          );
          if (geminiRes.ok) {
            const gjson: any = await geminiRes.json();
            const raw = (gjson.candidates?.[0]?.content?.parts || [])
              .map((p: any) => p.text)
              .join("\n");
            let parsed: any;
            try {
              const jsonMatch = raw.match(/\{[\s\S]*\}/);
              parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
              suitable = Boolean(parsed.suitable);
              planReason =
                typeof parsed.reason === "string"
                  ? parsed.reason.trim()
                  : undefined;
              if (Array.isArray(parsed.suggestions)) {
                suggestions = parsed.suggestions.join("\n").trim();
              }
            } catch {
              // Fallback minimal reasoning
              suitable = comfort.level >= 3;
              planReason = `Heuristic fallback: comfort level ${comfort.level}.`;
            }
          } else {
            suitable = comfort.level >= 3;
            planReason = `Gemini error status ${geminiRes.status}; fallback heuristic.`;
          }
        } catch (e: any) {
          suitable = comfort.level >= 3;
          planReason = `Gemini failure: ${e?.message || e}`;
        }
      } else {
        suitable = comfort.level >= 3;
        planReason = "No GEMINI_API_KEY configured; heuristic assessment.";
      }
      if (!suggestions) {
        // Provide at least a minimal suggestions list fallback
        suggestions = suitable
          ? "* Add hydration breaks – Stay energized – Pack water\n* Light layers clothing – Adjust to temp shifts – Bring a light jacket\n* Backup indoor cafe meetup – Social pivot – Avoid sudden weather turns\n* Early start – Use milder temps – Beat potential afternoon changes"
          : "* Indoor museum visit – Weather-safe culture – Stay dry\n* Local cafe work session – Productive alternative – Shelter from conditions\n* Board game meetup – Social engagement – Indoors comfort\n* Fitness class – Maintain activity – Climate-controlled environment";
      }
    }
    const payload = {
      location: data.city?.name || location,
      condensed,
      comfort,
      raw: items,
      plan: plan || undefined,
      suitable,
      suggestions,
      planReason,
      assessment,
      displayDate: rawDate, // preserve user-entered format
    };
    return Response.json({ source: "live", ...payload });
  } catch (e: any) {
    return Response.json(
      { error: e?.message || "unknown error" },
      { status: 500 }
    );
  }
}
