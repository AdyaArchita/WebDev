// frontend/src/services/weatherService.js
export async function fetchWeatherByCity(city) {
  const res = await fetch(`${import.meta?.env?.VITE_API_BASE || 'http://localhost:5000'}/api/weather?city=${encodeURIComponent(city)}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  return json.data;
}