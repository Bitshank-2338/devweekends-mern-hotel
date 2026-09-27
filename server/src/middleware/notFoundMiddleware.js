// Runs when no route matched the request. Builds a 404 error and hands it to
// the central error handler so unknown endpoints answer with JSON too.
function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

module.exports = notFound;
