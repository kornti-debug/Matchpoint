// Import the function to get default error messages, in case no custom message is set.
const { getDefaultErrorMessage } = require("../lib/error");

/**
 * Controller to render the error page.
 * It reads the status code and message attached to the request object.
 * If these are missing, it uses default values.
 */
function showErrorPage(req, res) {
    // Get the status code from the request or default to 500.
    const statusCode = req.statusCode || 500;
    // Get the error message from the request or use the default for this code.
    const message = req.errorMessage || getDefaultErrorMessage(statusCode);

    // Render the 'error' template/view with error info for the user.
    res.status(statusCode).json({
        error: message,
        statusCode: statusCode,
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
}

// Export the controller function for routes to call when rendering errors.
module.exports = {
    showErrorPage
};
