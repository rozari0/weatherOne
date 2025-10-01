## Weather One

Retro styled weather & comfort dashboard built on Next.js with RetroUI-inspired components.

### Features

- **Weather Analysis**: City + Date (next 5 days) forecast using OpenWeather 5-day / 3-hour API.
- Aggregates selected date into average temperature, humidity & wind.
- Computes a comfort level score (1–5) with explanation.
- NASA APOD image for ambience (uses DEMO_KEY if no key set).
- Simple in-memory caching of API responses.
- Optional plan assessment: enter an activity; if weather comfort is low, AI (Gemini) suggests alternatives.
- **Community Posts**: AI-powered moderated community posting system where users can share thoughts and experiences.
  - Uses Google Gemini API for intelligent content moderation
  - Automatically detects spam, NSFW content, harassment, and toxicity
  - Falls back to basic validation when Gemini API is unavailable

### Quick Start

```bash
pnpm install
cp .env.example .env.local
# edit .env.local with keys and MongoDB connection
pnpm dev
```

Visit http://localhost:3000 for the homepage, or:
- http://localhost:3000/weather for weather analysis
- http://localhost:3000/community for community posts

### Environment Variables

| Variable            | Required | Description                                                       |
| ------------------- | -------- | ----------------------------------------------------------------- |
| OPENWEATHER_API_KEY | Yes      | OpenWeather API key for forecast requests                         |
| NASA_API_KEY        | No       | NASA API key (APOD). Uses DEMO_KEY if absent                      |
| GEMINI_API_KEY      | No       | Google Gemini API key for alternative plan suggestions (optional) |
| MONGODB_URI         | Yes*     | MongoDB connection string for community posts                     |

*MongoDB is required for the community feature. Use a local MongoDB instance or cloud service like MongoDB Atlas.

### Comfort Levels

1 Very Uncomfortable – extreme conditions
2 Uncomfortable – outside ideal ranges
3 Moderate – acceptable but not ideal
4 Comfortable – good for most activities
5 Ideal – near optimal

### API Routes

**Weather:**
- POST /api/weather { location, date }
- GET /api/apod?date=YYYY-MM-DD

**Community:**
- GET /api/community?page=1&limit=10 (fetch posts)
- POST /api/community { name, email?, content } (create post)

When including a plan in the weather POST body, response adds { plan, suitable, suggestions }

### Community Features

- **AI-Powered Content Moderation** using Google Gemini API
  - Intelligent detection of spam, NSFW content, harassment, and toxicity
  - Contextual understanding for weather community posts
  - Automatic fallback to basic validation when API is unavailable
- Name and email validation with format checking
- Character limits and input sanitization
- Pagination for efficient post browsing
- Privacy protection (emails not exposed publicly)
- Responsive retro-styled UI consistent with the weather pages

### Ideas / Next Steps

- Hourly breakdown timeline
- Geolocation + reverse geocode
- Unit switch (metric/imperial)
- Local history of searches

MIT License.
