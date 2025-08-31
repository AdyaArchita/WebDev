// src/components/Weather.jsx
import React, { useEffect, useState } from "react";
import { fetchWeatherByCity } from "../services/weatherService";

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("Delhi");
  const [darkMode, setDarkMode] = useState(true); // 🌙 default dark mode


  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchWeatherByCity(city);
        setWeather(data);
      } catch (err) {
        console.error("Weather fetch failed:", err.message);
        setWeather(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [city]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        Loading weather...
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Failed to load weather data.
      </div>
    );
  }


  // Check if it's day or night in the selected city
const isDaytime = () => {
  if (!current?.sunrise || !current?.sunset) return true;
  const now = new Date(location?.localtime || Date.now()).getTime();
  const sunrise = new Date(current.sunrise).getTime();
  const sunset = new Date(current.sunset).getTime();
  return now >= sunrise && now <= sunset; // true = daytime
};

  const { location, current, hourly, daily } = weather;

  // 🎨 Colors change with theme
  const bg = darkMode ? "bg-[#2d2f3a]" : "bg-gray-100";
  const card = darkMode ? "bg-[#3a3c49]" : "bg-white shadow";
  const text = darkMode ? "text-white" : "text-gray-900";
 // add inside your component (top-level, before return)
const titleCase = (s = "") =>
  s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className={`flex min-h-screen ${bg} ${text}`}>
      {/* Sidebar */}
      <aside
        className={`${darkMode ? "bg-[#242632]" : "bg-gray-200"} w-20 flex flex-col items-center py-6 space-y-6`}
      >
        <div className="text-yellow-400 text-3xl">☁️</div>
        <button className="hover:scale-110 transition">☰</button>
        <button className="hover:scale-110 transition">⚙️</button>
        <button className="hover:scale-110 transition">❓</button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Weather Navigator</h1>
          <div className="flex items-center gap-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const value = e.target.city.value.trim();
                if (value) setCity(value);
              }}
            >
              <input
                name="city"
                placeholder="Search city..."
                className="px-4 py-2 rounded-xl text-black"
              />
            </form>
            {/* 🌙 Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-gray-300 dark:bg-gray-700"
            >
              {darkMode ? "🌙" : "☀️"}
            </button>
          </div>
        </div>

        {/* Top weather card */}
<div
  className={`${card} rounded-2xl p-6 flex justify-between items-center shadow-lg relative overflow-hidden`}
  style={{
    backgroundImage: `url(${isDaytime() ? "/bg/day.jpg" : "/night-bg.jpg"})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  {/* Gradient overlay */}
  <div className="absolute inset-0 bg-black/40 rounded-2xl"></div>

  {/* Left side: text */}
  <div className="relative z-10">
    <p className="text-lg">
      {new Date().toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
    </p>
    <h2 className="text-2xl font-bold mt-2">
      {location?.name}, {location?.country}
    </h2>
    <p className="text-6xl font-bold mt-4">
      {Math.round(current?.tempC)}°C
    </p>
    <p className="text-lg">RealFeel {Math.round(current?.feelsLikeC)}°C</p>
    <p className="capitalize mt-2">{current?.condition?.text}</p>
  </div>

  {/* Right side: big weather icon */}
  <img
    src={`https://openweathermap.org/img/wn/${current?.condition?.icon}@4x.png`}
    alt={current?.condition?.text}
    className="h-40 w-40 relative z-10 drop-shadow-xl"
  />
</div>


        {/* Today's Highlight */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Today’s Highlight</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { label: "Wind Status", value: `${current?.windKph} km/h` },
              { label: "Humidity", value: `${current?.humidity}%` },
              { label: "Pressure", value: `${current?.pressure} hPa` },
              { label: "Visibility", value: `${current?.visibilityKm} km` },
              {
                label: "Sunrise",
                value: new Date(current?.sunrise).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
              {
                label: "Sunset",
                value: new Date(current?.sunset).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ].map((item, i) => (
              <div key={i} className={`${card} p-4 rounded-xl`}>
                <p className="text-gray-300">{item.label}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Forecast */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Hourly Forecast</h3>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {hourly?.map((h, i) => (
              <div
                key={i}
                className={`${card} p-4 rounded-xl text-center min-w-[100px]`}
              >
                <p>
                  {new Date(h.timeISO).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <img
                  src={`https://openweathermap.org/img/wn/${h.icon}@2x.png`}
                  alt={h.conditionText}
                  className="mx-auto"
                />
                <p>{Math.round(h.tempC)}°C</p>
              </div>
            ))}
          </div>
        </div>

{/* 5 Day Forecast */}
<div>
  <h3 className="text-xl font-semibold mb-4">5 Days Forecast</h3>
  <div className="space-y-3">
    {daily?.map((d, i) => (
      <div
        key={i}
        className={`grid grid-cols-[1fr_120px_1fr] items-center ${card} p-4 rounded-xl`}
      >
        {/* Left: Icon + Condition */}
        <div className="flex items-center gap-4">
          <img
            src={`https://openweathermap.org/img/wn/${d.icon}@2x.png`}
            alt={d.conditionText}
            className="h-10 w-10 flex-none"
          />
          <span className="font-medium truncate">
            {d.conditionText
              .split(" ")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")}
          </span>
        </div>

        {/* Middle: Temps (fixed width so they align across rows) */}
        <span className="text-center font-semibold whitespace-nowrap">
          {Math.round(d.minC)}°C / {Math.round(d.maxC)}°C
        </span>

        {/* Right: Date */}
        <span className="text-gray-300 text-right whitespace-nowrap">
          {new Date(d.dateISO).toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>
    ))}
  </div>
</div>

      </main>
    </div>
  );
};

export default Weather;
