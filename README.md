## Retro Weather App

Retro styled weather & comfort dashboard built on Next.js with RetroUI-inspired components.

### Features

- City + Date (next 5 days) forecast using OpenWeather 5-day / 3-hour API.
- Aggregates selected date into average temperature, humidity & wind.
- Computes a comfort level score (1–5) with explanation.
- NASA APOD image for ambience (uses DEMO_KEY if no key set).
- Simple in-memory caching of API responses.
- Optional plan assessment: enter an activity; if weather comfort is low, AI (Gemini) suggests alternatives.

### Quick Start

```bash
pnpm install
cp .env.example .env.local
# edit .env.local with keys
pnpm dev
```

Visit http://localhost:3000/weather

### Environment Variables

| Variable            | Required | Description                                                       |
| ------------------- | -------- | ----------------------------------------------------------------- |
| OPENWEATHER_API_KEY | Yes      | OpenWeather API key for forecast requests                         |
| NASA_API_KEY        | No       | NASA API key (APOD). Uses DEMO_KEY if absent                      |
| GEMINI_API_KEY      | No       | Google Gemini API key for alternative plan suggestions (optional) |

### Comfort Levels

1 Very Uncomfortable – extreme conditions
2 Uncomfortable – outside ideal ranges
3 Moderate – acceptable but not ideal
4 Comfortable – good for most activities
5 Ideal – near optimal

### API Routes

POST /api/weather { location, date }
GET /api/apod?date=YYYY-MM-DD
// When including a plan in the POST body, response adds { plan, suitable, suggestions }

### Ideas / Next Steps

- Hourly breakdown timeline
- Geolocation + reverse geocode
- Unit switch (metric/imperial)
- Local history of searches

MIT License.
