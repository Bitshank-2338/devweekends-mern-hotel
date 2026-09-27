// Wraps an async controller so a rejected promise is handed to the error
// middleware instead of crashing the server. Saves a try/catch in every route.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
