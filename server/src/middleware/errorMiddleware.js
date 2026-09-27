// The one place where errors become responses. Express recognises it as an
// error handler because it takes four arguments, so it keeps all four even
// though `next` is unused. Every failure has the same shape: { message }.
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  // A schema rule failed. Report the first message so the UI can show it.
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)[0].message;
  }

  // Mongoose could not cast a value, typically a malformed ObjectId.
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  // A unique index rejected the write. Only User.email is unique here.
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Email is already registered';
  }

  // express.json() could not parse the request body.
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Request body must be valid JSON';
  }

  // Hide raw database/driver messages from users in production.
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Something went wrong on the server';
  }

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    message,
    // Stack traces help while developing but must never reach users.
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}

module.exports = errorHandler;
