export async function fetchWeatherByCity(city) {
  const base = import.meta.env.VITE_API_BASE || "http://localhost:5000";
  console.log("Calling API:", `${base}/api/weather?city=${city}`);

  const res = await fetch(`${base}/api/weather?city=${encodeURIComponent(city)}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  const json = await res.json();
  return json.data;
}
