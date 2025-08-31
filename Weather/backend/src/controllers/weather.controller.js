const service = require('../services/openweather.service');
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

exports.getByCity = asyncHandler(async (req, res) => {
  const { city } = req.query;
  const data = await service.fetchByCity(city);
  res.json({ success: true, data });
});

exports.getByCoords = asyncHandler(async (req, res) => {
  const { lat, lon } = req.query;
  const data = await service.fetchByCoords(Number(lat), Number(lon));
  res.json({ success: true, data });
});