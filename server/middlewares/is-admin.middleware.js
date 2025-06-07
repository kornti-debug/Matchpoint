const {getUser} = require("../models/user.model");
const {createError} = require("../lib/error");

/**
 * Middleware to check if the authenticated user has admin privileges.
 *
 * This middleware verifies the user's authentication and role. If the user is not authenticated
 * or does not have admin privileges, it responds with an appropriate error status.
 */
module.exports = {
    isAdmin: (req, res, next) => {
        if (!req.user || !req.user.id) {
            return res.status(401).send('Authentication required');
        }

        getUser(req.user.id)
            .then(user => {
                if (!user) {
                    return next(createError(404));
                }

                if (user.role !== 'admin') {
                    console.log("403: User is not an admin");
                    return next(createError(403));
                }

                next();
            })
            .catch(error => {
                console.error('Error verifying role:', error);
                next(createError(500));
            });
    }
}