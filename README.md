# 🌦 Project Minus One  

## Summary  
We developed **Weather One**, a retro-styled weather and comfort dashboard designed to reduce the uncertainty of planning outdoor activities. Unlike typical weather apps that provide short-term forecasts, Weather One leverages NASA’s POWER ARD climate data, combined with the OpenWeather API and Google Gemini, to estimate the likelihood of conditions such as heat, rain, wind, and humidity for any city and date even months in advance.  

Users simply select a location, date, and optionally an activity. The app then calculates averages, assigns a comfort score, and generates a clear plan assessment. If conditions look unfavorable, Weather One suggests safe indoor or alternative activities. A built-in community feature allows users to share weather experiences, moderated intelligently by AI.  

By making complex Earth observation data simple and actionable, Weather One empowers event organizers, families, travelers, and outdoor enthusiasts to plan with confidence, reduce risks, and avoid wasted time or resources. In an era of climate uncertainty, Weather One demonstrates how space-based data can directly improve daily life.  

---

## 📽️ Project Demonstration  
▶️ [Watch on YouTube](https://youtu.be/NJcMGStUyns)  

---

## 📂 Project Repository  
👉 [GitHub – Weather One](https://github.com/rozari0/weatherOne)  

---

## Project Details  

**Weather One** is our solution to the uncertainty of planning outdoor activities. It is a web application that helps people know the likelihood of different weather conditions such as rain, heat, wind, or humidity for any city and date, even months in advance.  

It is a retro-styled weather and comfort dashboard built on **Next.js** with **RetroUI-inspired components**. The app helps people plan with confidence, using **NASA’s POWER ARD climate data**, the **OpenWeather API**, and **Google Gemini** for intelligent recommendations and moderation.  

Our goal is to make people feel prepared, safe, and confident when planning outdoor activities.  

---

## 🔎 What does it do or how does it work?  

Weather One works by combining historical climate data with real-time weather inputs and translating them into user-friendly results.  

- **User Input:** Enter your city, the date you’re planning for, and optionally your activity (like hiking, football, or a parade).  
- **Data Gathering:** The app pulls long-term historical data from NASA’s POWER ARD API and short-term forecasts from OpenWeatherMap.  
- **Analysis:** It calculates averages (temperature, humidity, wind, rainfall) and assigns a **comfort score (1–5)**.  
- **Output:** You receive a weather summary, comfort level, and a plan assessment (e.g., “Not ideal for football” or “Good conditions for a beach day”).  
- **Suggestions:** If the weather isn’t suitable, the app recommends indoor or weather-safe alternatives (like museums, cafés, or fitness classes).  

This process makes complex climate data easy to understand—users don’t just see numbers, they see what it *means for their plans*.  

---

## ✨ Features  

- **Weather Analysis:**  
  - City + Date forecast (next 5 days) via OpenWeather 5-day / 3-hour API.  
  - Aggregates data into average temperature, humidity, and wind.  
  - Computes a comfort score (1–5) with explanations.  

- **NASA Ambience:**  
  - Displays the **NASA Astronomy Picture of the Day (APOD)** for added atmosphere (uses DEMO_KEY if no key is set).  

- **Plan Assessment:**  
  - Enter an activity (e.g., football, hiking).  
  - If comfort is low, AI (Gemini) suggests safer or indoor alternatives.  

- **Community Posts:**  
  - Users can share weather-related thoughts and experiences.  
  - **AI-powered moderation** (Gemini API) filters spam, NSFW content, harassment, and toxicity.  
  - Privacy safe (emails hidden), input validation, and pagination for browsing.  
  - Retro styled, responsive UI for a consistent experience.  

- **Performance:**  
  - Simple in-memory caching of API responses for faster results.  

---

## 🌟 Benefits  

- **Confidence in Planning:** Prepare events or trips months ahead without fear of sudden surprises.  
- **Personalized Results:** Weather is tied directly to your planned activity.  
- **Safety:** Avoid risks from extreme heat, storms, or humidity.  
- **Productivity & Enjoyment:** Even if weather is bad, get meaningful alternatives.  
- **Accessibility:** Simple and usable by families, event organizers, and students.  

---

## 🎯 Intended Impact  

Our goal is to make NASA’s climate data useful in daily life. Weather One aims to:  
- Reduce cancellations and disappointments for outdoor plans.  
- Help communities and organizers plan safer events.  
- Educate everyday users about how weather and climate affect them.  
- Demonstrate how **space and Earth data** can improve decision-making.  

In short, Weather One is designed to make people feel **prepared, safe, and confident**.  

---

## ⚙️ Tools, Languages & Software  

- **Next.js** → fast, scalable web app framework  
- **RetroUI** → clean, responsive, retro-styled design system  
- **Gemini Flash 2.5** → AI for summaries, recommendations, and moderation  
- **OpenWeatherMap API** → real-time weather conditions  
- **NASA POWER ARD API** → historical climate data  
- **MongoDB** → for community post storage  

**Languages:** JavaScript & TypeScript  
**Hosting:** Vercel  

---

## 🌡 Comfort Levels  

1. Very Uncomfortable – extreme conditions  
2. Uncomfortable – outside ideal ranges  
3. Moderate – acceptable but not ideal  
4. Comfortable – good for most activities  
5. Ideal – near optimal  

---

## 👥 Community Features  

- AI-powered moderation (Gemini API)  
- Detects spam, NSFW, harassment, toxicity  
- Fallback to basic validation when AI unavailable  
- Input sanitization & character limits  
- Pagination for efficient browsing  
- Privacy-first → emails never exposed  
- Retro UI consistent with weather dashboard  

---

## 🔌 API Routes  

**Weather**  
- `POST /api/weather { location, date }`  
- `GET /api/apod?date=YYYY-MM-DD`  

### Community  

- `GET /api/community?page=1&limit=10` → fetch posts  
- `POST /api/community { name, email?, content }` → create post  

---

## 🎨 Creativity  

Most weather apps stop at giving numbers and forecasts. **Weather One** goes further:  

- **Goes beyond forecasting** → Uses probabilities from decades of data, not just short-term forecasts.  
- **Tells a story** → Instead of “27.5°C, 86% humidity,” it says “Moderate conditions, suitable for soccer.”  
- **Offers alternatives** → Suggests safe, enjoyable activities if conditions are poor.  
- **Balances fun with accuracy** → Useful for kids, families, and professionals alike.  

---

## 🛠️ Design Considerations  

- **Simplicity:** Easy to use — just enter a city and date.  
- **Flexibility:** Weather preferences vary (rain can be bad for football but great for farmers).  
- **Transparency:** Users can download underlying data (CSV/JSON).  
- **Accessibility:** Works on mobile and desktop.  
- **Global Reach:** NASA data ensures worldwide coverage.  
- **Educational Value:** Kids can learn about weather patterns, not just forecasts.  
- **Future Growth:** Scalable for notifications, seasonal insights, and event-planning integration.  

---

## 🚀 Future Plans  

We see Weather One as more than just a web app. Our roadmap focuses on making it smarter, more global, and more accessible:  

- **User Notifications** → Alerts for upcoming weather risks, comfort changes, and reminders.  
- **Mobile App Versions** → Expanding into iOS/Android.  
- **Community & Event Integration** → Linking with calendars and local event apps.  
- **AI Trend Analysis** → Predicting seasonal changes and long-term shifts.  
- **Hourly Breakdown Timeline** → Hourly-level detail for selected dates.  
- **Geolocation + Reverse Geocoding** → Auto-detect locations.  
- **Unit Switching** → Metric/imperial unit support.  
- **Local Search History** → Keep record of recent searches.  
- **Expanded Activity Templates** → Better plan assessments for more activities.  
- **Localization** → Multi-language support for global users.  

---

## 👥 Who Can Use Weather One?  

- **Event Organizers** → Safer planning for parades, festivals, and sports.  
- **Travelers & Tourists** → Pick the best dates for trips.  
- **Hikers & Outdoor Enthusiasts** → Avoid unsafe conditions.  
- **Families & Communities** → Choose better days for outings.  
- **Educators & Students** → Learn how NASA data connects to real life.  
- **Researchers & Data Enthusiasts** → Access downloadable datasets for deeper analysis.  

---

## 🌍 Real World Relevance  

We designed Weather One with **real-world usability** in mind. Climate change and unpredictable weather patterns affect communities everywhere. By making NASA’s climate data accessible, our app helps people prepare better and reduces risks of wasted time, money, and resources.  

---

## 🤖 Use of Artificial Intelligence (AI)  

We used AI tools to support development and presentation of our project in the following ways:  

- **ChatGPT:** Assisted in brainstorming, refining ideas, drafting scripts, and structuring documentation.  
- **Gemini (Google):** Integrated to provide activity-based recommendations and AI-powered moderation for community posts (spam, NSFW, harassment, toxicity).  
- **Gemini’s Veo:** Used for video generation in our final presentation.  
- **AI Image Generation:** Some visual assets were created with AI (all watermarked as AI-generated in compliance with guidelines).  

All AI-assisted work has been clearly documented, and no NASA logos, mission identifiers, or branding elements were generated or modified using AI.  

---

## 📊 NASA Data  

- **NASA POWER ARD API**  
