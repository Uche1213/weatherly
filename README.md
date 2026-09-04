# Weatherly

Weatherly is a calm, responsive weather dashboard for understanding current conditions and planning the hours ahead. It uses live data from Open-Meteo and requires no API key.

## Features

- Live current conditions, feels-like temperature, precipitation, humidity, wind, pressure, visibility, and UV index
- Scrollable 12-hour forecast with precipitation probability
- Responsive seven-day forecast and SVG temperature trend chart
- Worldwide city search with debouncing, cancellation, keyboard selection, and clear empty states
- Browser geolocation with friendly permission and availability errors
- Favorite locations and recent searches persisted in local storage
- Celsius/Fahrenheit and km/h, mph, or m/s display settings
- Light and dark themes with subtle condition-aware atmospheres
- Skeleton loading, retryable errors, visible focus states, and reduced-motion support

## Screenshots

Screenshots can be added here as the interface evolves. The application is designed for desktop, tablet, and mobile widths.

## Tech Stack

- React 18
- TypeScript
- Vite
- Lucide React
- Open-Meteo Forecast and Geocoding APIs

## Architecture

The app keeps UI composition in `src/App.tsx`, with responsibilities separated into small modules:

- `src/types/weather.ts` contains the location and weather data contracts.
- `src/services/weatherApi.ts` owns Open-Meteo requests and API response transformation.
- `src/utils/weather.ts` owns condition mapping, unit conversion, formatting, and insights.
- `src/styles.css` contains responsive layout, theme tokens, accessible states, and atmosphere styling.

## API

Weatherly uses the free [Open-Meteo forecast API](https://open-meteo.com/en/docs) for current, hourly, and daily weather data, and the [Open-Meteo geocoding API](https://open-meteo.com/en/docs/geocoding-api) for location search. No environment variables or API key are required.

## Getting Started

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

## Environment Variables

None are required.

## Roadmap

- Add a dedicated reverse-geocoding provider so geolocation can show a nearby city name.
- Add automated unit tests for weather transformations and insight rules.
- Add optional weather alerts when a reliable alerts source is available.

## What I Learned

Weather data becomes more useful when raw measurements are transformed into clear decisions: what is happening now, what is changing soon, and how someone might prepare. The project also demonstrates keeping API concerns and display formatting separate so unit settings do not change the underlying data.

## License

This project is available for personal and portfolio use. Open-Meteo data remains subject to its provider's terms.
