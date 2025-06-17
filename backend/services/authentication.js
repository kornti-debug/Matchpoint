const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

// Exit if secret is missing
if (!ACCESS_TOKEN_SECRET) {
    console.error('ACCESS_TOKEN_SECRET is not defined in the environment variables.');
    process.exit(1);
}

// Login: verify user and issue JWT token
async function authenticateUser({ username, password }, users, res) {

    const user = users.find(user => user.username === username); // Find user by email

    // CHECK IF USER EXISTS FIRST
    if (!user) {
        console.log('User not found with username:', username);
        return res.status(401).json({ message: 'Invalid credentials' }); // Changed to JSON
    }

    console.log('User found:', { id: user.id, username: user.username });

    const passwordMatches = await bcrypt.compare(password, user.password); // Compare passwords
    console.log('Password matches:', passwordMatches);

    if (!passwordMatches) {
        return res.status(401).json({ message: 'Invalid credentials' }); // Changed to JSON
    }

    if (passwordMatches) {
        // Create JWT token with user data
        const accessToken = jwt.sign({
            id: user.id,
            username: user.username,
        }, ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        // FOR API: Return JSON instead of redirect
        res.json({
            message: 'Login successful',
            token: accessToken,
            user: {
                id: user.id,
                username: username
            }
        });

        // OLD CODE (for web app):
        // res.cookie('accessToken', accessToken, { httpOnly: true });
        // res.redirect('/users/' + user.id);
    }
}

// Middleware: verify JWT from cookies
function authenticateJWT(req, res, next) {
    let token = req.headers.authorization;


    if (!token) {
        return res.status(401).send('no token'); // Redirect if no token
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    if (token) {
        jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.status(401).send('invalid token'); // Redirect if token is invalid/expired
            }
            req.user = user; // Attach user data to request
            next(); // Continue to next middleware/route
        });
    }
}

module.exports = { authenticateUser, authenticateJWT };