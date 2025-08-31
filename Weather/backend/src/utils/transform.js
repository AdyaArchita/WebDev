function toWindDirection(deg) {
  if (typeof deg !== 'number') return null;
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(((deg % 360) / 22.5)) % 16];
}

function msToKph(ms) {
  return (ms || 0) * 3.6;
}

function withTimezone(date, tzOffsetSec) {
  // Return a new Date shifted by tz offset (sec) from UTC, but keep ISO string of the local time
  const utcMs = date.getTime();
  const shifted = new Date(utcMs + (tzOffsetSec || 0) * 1000);
  return shifted;
}

function groupForecastDaily(list, tzOffsetSec) {
  const byDay = new Map();
  for (const item of list) {
    const local = withTimezone(new Date(item.dt * 1000), tzOffsetSec);
    const y = local.getUTCFullYear();
    const m = String(local.getUTCMonth()+1).padStart(2,'0');
    const d = String(local.getUTCDate()).padStart(2,'0');
    const key = `${y}-${m}-${d}`;

    const entry = byDay.get(key) || { dateISO: `${y}-${m}-${d}`, minC: Infinity, maxC: -Infinity, iconFreq: {}, sample: null };
    entry.minC = Math.min(entry.minC, item.main?.temp_min ?? item.main?.temp ?? Infinity);
    entry.maxC = Math.max(entry.maxC, item.main?.temp_max ?? item.main?.temp ?? -Infinity);
    // track most frequent icon
    const icon = item.weather?.[0]?.icon || '01d';
    entry.iconFreq[icon] = (entry.iconFreq[icon] || 0) + 1;
    // pick the sample closest to 12:00 for text
    const hour = local.getUTCHours();
    if (!entry.sample || Math.abs(hour - 12) < Math.abs(entry.sampleHour - entry.sampleHour)) {
      entry.sample = item;
      entry.sampleHour = hour;
    }
    byDay.set(key, entry);
  }

  const days = Array.from(byDay.values())
    .sort((a,b) => a.dateISO.localeCompare(b.dateISO))
    .map(d => {
      const icon = Object.entries(d.iconFreq).sort((a,b) => b[1]-a[1])[0]?.[0] || '01d';
      const text = d.sample?.weather?.[0]?.description || '';
      return {
        dateISO: d.dateISO,
        minC: d.minC === Infinity ? null : Math.round(d.minC),
        maxC: d.maxC === -Infinity ? null : Math.round(d.maxC),
        icon,
        conditionText: text
      };
    });
  // Keep next 5 days
  return days.slice(0, 5);
}

module.exports = { toWindDirection, msToKph, withTimezone, groupForecastDaily };