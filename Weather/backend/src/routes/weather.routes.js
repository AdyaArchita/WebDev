const express = require('express');
const router = express.Router();

const controller = require('../controllers/weather.controller');
const { cacheByQuery } = require('../middleware/cache');
const { validateCityQuery, validateCoordsQuery } = require('../middleware/validateQuery');

// GET /api/weather?city=Delhi
router.get('/', validateCityQuery, cacheByQuery('city'), controller.getByCity);

// GET /api/weather/coords?lat=..&lon=..
router.get('/coords', validateCoordsQuery, cacheByQuery('lat,lon'), controller.getByCoords);

module.exports = router;