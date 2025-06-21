/**
 * Middleware to normalize the room code to uppercase
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
const normalizeRoomCode = (req, res, next) => {
    if (req.params.roomCode) {
        req.params.roomCode = req.params.roomCode.toUpperCase();
    }
    next();
};

module.exports = { normalizeRoomCode };