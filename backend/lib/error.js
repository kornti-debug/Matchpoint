// This function creates a new Error object with a status code and message.
// If no message is given, it picks a default message based on the status code.
function createError(statusCode = 500, message = null) {
    // Create a new Error object. Use the provided message or get the default one.
    const error = new Error(message ?? getDefaultErrorMessage(statusCode));
    // Attach the status code to the error for later use.
    error.statusCode = statusCode;
    // Return the customized error object.
    return error;
}

// This function returns a default error message string for a given HTTP status code.
function getDefaultErrorMessage(statusCode) {
    // A mapping of common HTTP status codes to their descriptive error messages.
    const errorMessages = {
        400: 'Bad Request - The backend could not understand your request',
        401: 'Unauthorized - Authentication is required to access this resource',
        403: 'Forbidden - You do not have permission to access this resource',
        404: 'Not Found - The requested resource could not be found',
        500: 'Internal Server Error - Something went wrong on our end',
        502: 'Bad Gateway - The backend received an invalid response',
        503: 'Service Unavailable - The backend is temporarily unavailable',
        504: 'Gateway Timeout - The backend timed out waiting for the request'
    };

    // Return the message for the given status code, or a generic message if not found.
    return errorMessages[statusCode] || 'An unexpected error occurred';
}

// Export the functions so other modules can create errors and get messages.
module.exports = {
    createError,
    getDefaultErrorMessage
}
