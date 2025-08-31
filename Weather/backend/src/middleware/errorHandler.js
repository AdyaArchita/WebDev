function notFound(req, res, next) {
  res.status(404).json({ success: false, error: 'Route not found' });
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || err.response?.status || 500;
  const message =
    err.message ||
    err.response?.data?.message ||
    err.response?.data?.error ||
    'Internal Server Error';
  if (status >= 500) {
    console.error('[weather-backend] error:', err.stack || err);
  }
  res.status(status).json({ success: false, error: message });
}

module.exports = { errorHandler, notFound };