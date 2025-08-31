const NodeCache = require('node-cache');
const crypto = require('crypto');

const ttl = Number(process.env.CACHE_TTL || 300);
const cache = new NodeCache({ stdTTL: ttl, checkperiod: Math.max(30, Math.floor(ttl/2)) });

function keyForRequest(req, fieldsCsv) {
  const url = req.baseUrl + req.path;
  let keyPayload;
  if (fieldsCsv) {
    const fields = fieldsCsv.split(',').map(s => s.trim());
    keyPayload = {};
    fields.forEach(f => keyPayload[f] = req.query[f]);
  } else {
    keyPayload = { method: req.method, originalUrl: req.originalUrl };
  }
  const raw = JSON.stringify(keyPayload);
  const hash = crypto.createHash('sha1').update(raw).digest('hex');
  return `${url}:${hash}`;
}

function cacheByQuery(fieldsCsv = '') {
  return (req, res, next) => {
    if (req.headers['x-refresh'] === 'true') return next();
    const key = keyForRequest(req, fieldsCsv);
    const hit = cache.get(key);
    if (hit) {
      return res.json(hit);
    }
    const origJson = res.json.bind(res);
    res.json = (body) => {
      cache.set(key, body);
      return origJson(body);
    };
    next();
  };
}

module.exports = { cacheByQuery };