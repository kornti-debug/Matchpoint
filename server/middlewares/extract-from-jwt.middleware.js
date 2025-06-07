const {verify} = require("jsonwebtoken");
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

/**
 * Middleware to extract user information from a JWT stored in cookies.
 *
 * This middleware verifies the JWT using the secret key and extracts the user profile
 * information from the token. The extracted profile is attached to the `req` object
 * and made available in `res.locals` for use in templates or subsequent middleware.
 *
 * If the token is missing or invalid, the middleware simply calls `next()` without
 * modifying the request or response objects.
 */
function extractUserFromToken(req, res, next) {
    try {
        const token = req.cookies.accessToken;

        if (token) {
            const decoded = verify(token, ACCESS_TOKEN_SECRET);
            req.profile = {
                id: decoded.id,
                name: decoded.name,
                surname: decoded.surname,
                role: decoded.role,
                imageId: decoded.imageId
            };
            res.locals.profile = req.profile || null;
            next();
        } else {
            next();
        }
    } catch {
        next();
    }
}

module.exports = { extractUserFromToken };