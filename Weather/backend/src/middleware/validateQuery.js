function validateCityQuery(req, res, next) {
  const { city } = req.query;
  if (!city || typeof city !== 'string' || city.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Query param ?city= is required' });
  }
  req.query.city = city.trim();
  next();
}

function validateCoordsQuery(req, res, next) {
  const { lat, lon } = req.query;
  const la = Number(lat), lo = Number(lon);
  if (!lat || !lon || Number.isNaN(la) || Number.isNaN(lo)) {
    return res.status(400).json({ success: false, error: 'Query params lat, lon must be valid numbers' });
  }
  next();
}

module.exports = { validateCityQuery, validateCoordsQuery };