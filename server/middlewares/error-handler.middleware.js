/**
 * Middleware to handle errors in the application.
 *
 * This middleware catches errors passed to next(err) in routes or other middlewares.
 * It sets the statusCode and errorMessage properties on the request object.
 * Then, it calls next() to continue to the next middleware or error page.
 */
function errorHandler(err, req, res, next) {
    // Assign the error status code or use 500 if none is specified.
    req.statusCode = err.statusCode || 500;
    // Assign the error message or use a generic fallback.
    req.errorMessage = err.message || 'Something went wrong';

    // Move on to the next middleware, often an error rendering middleware.
    next();
}

// Export the middleware to be used in the Express app.
module.exports = {
    errorHandler
};
