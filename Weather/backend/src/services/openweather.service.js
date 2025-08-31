const axios = require('axios');
const { toWindDirection, groupForecastDaily, withTimezone, msToKph } = require('../utils/transform');

const API_KEY = process.env.OPENWEATHER_API_KEY;
if (!API_KEY) {
  console.warn('[weather-backend] OPENWEATHER_API_KEY missing. Set it in .env');
}

const client = axios.create({
  baseURL: 'https://api.openweathermap.org',
  timeout: 15000
});

async function geocode(city) {
  const { data } = await client.get('/geo/1.0/direct', {
    params: { q: city, limit: 1, appid: API_KEY }
  });
  if (!Array.isArray(data) || data.length === 0) {
    const err = new Error('City not found');
    err.status = 404;
    throw err;
  }
  const g = data[0];
  return { name: g.name, country: g.country, lat: g.lat, lon: g.lon, state: g.state || null };
}

async function getCurrent(lat, lon) {
  const { data } = await client.get('/data/2.5/weather', {
    params: { lat, lon, units: 'metric', appid: API_KEY }
  });
  return data;
}

async function getForecast(lat, lon) {
  // 5-day / 3-hour step
  const { data } = await client.get('/data/2.5/forecast', {
    params: { lat, lon, units: 'metric', appid: API_KEY }
  });
  return data;
}

function normalize(current, forecast, place) {
  const tzOffsetSec = forecast?.city?.timezone ?? current?.timezone ?? 0;

  const sunriseUtc = current?.sys?.sunrise ? current.sys.sunrise * 1000 : null;
  const sunsetUtc  = current?.sys?.sunset  ? current.sys.sunset  * 1000 : null;

  const sunrise = sunriseUtc ? withTimezone(new Date(sunriseUtc), tzOffsetSec).toISOString() : null;
  const sunset  = sunsetUtc  ? withTimezone(new Date(sunsetUtc ), tzOffsetSec).toISOString() : null;

  const windSpeedMs = current?.wind?.speed ?? 0;
  const visibilityKm = typeof current?.visibility === 'number' ? +(current.visibility / 1000).toFixed(1) : null;

  const currentBlock = {
    tempC: current?.main?.temp ?? null,
    feelsLikeC: current?.main?.feels_like ?? null,
    pressure: current?.main?.pressure ?? null,
    humidity: current?.main?.humidity ?? null,
    clouds: current?.clouds?.all ?? null,
    windKph: +msToKph(windSpeedMs).toFixed(1),
    windDir: toWindDirection(current?.wind?.deg),
    visibilityKm,
    condition: {
      code: current?.weather?.[0]?.id ?? null,
      text: current?.weather?.[0]?.description ?? '',
      icon: current?.weather?.[0]?.icon ?? '01d'
    },
    sunrise,
    sunset
  };

  const hourly = (forecast?.list || []).slice(0, 8).map(item => ({
    timeISO: withTimezone(new Date(item.dt * 1000), tzOffsetSec).toISOString(),
    tempC: item?.main?.temp ?? null,
    windKph: +msToKph(item?.wind?.speed ?? 0).toFixed(1),
    windDir: toWindDirection(item?.wind?.deg),
    conditionText: item?.weather?.[0]?.description ?? '',
    icon: item?.weather?.[0]?.icon ?? '01d'
  }));

  const daily = groupForecastDaily(forecast?.list || [], tzOffsetSec);

  return {
    location: {
      name: place?.name,
      country: place?.country,
      state: place?.state || null,
      lat: place?.lat,
      lon: place?.lon,
      timezoneOffsetSec: tzOffsetSec
    },
    current: currentBlock,
    hourly,
    daily
  };
}

async function fetchByCity(city) {
  const place = await geocode(city);
  const [cur, fc] = await Promise.all([getCurrent(place.lat, place.lon), getForecast(place.lat, place.lon)]);
  return normalize(cur, fc, place);
}

async function fetchByCoords(lat, lon) {
  const place = { name: 'Selected location', country: null, lat, lon, state: null };
  const [cur, fc] = await Promise.all([getCurrent(lat, lon), getForecast(lat, lon)]);
  // Try to backfill name/country from forecast.city if available
  if (fc?.city) {
    place.name = fc.city.name || place.name;
    place.country = fc.city.country || null;
  }
  return normalize(cur, fc, place);
}

module.exports = {
  fetchByCity,
  fetchByCoords
};