const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

// Exit if secret is missing
if (!ACCESS_TOKEN_SECRET) {
    console.error('ACCESS_TOKEN_SECRET is not defined in the environment variables.');
    process.exit(1);
}

// Login: verify user and issue JWT token
async function authenticateUser({ email, password }, users, res) {
    console.log('=== AUTHENTICATION SERVICE ===');
    console.log('Looking for email:', email);
    console.log('Available users:', users.map(u => ({ id: u.id, email: u.email })));

    const user = users.find(user => user.email === email); // Find user by email

    // CHECK IF USER EXISTS FIRST
    if (!user) {
        console.log('User not found with email:', email);
        return res.status(401).json({ message: 'Invalid credentials' }); // Changed to JSON
    }

    console.log('User found:', { id: user.id, email: user.email });

    const passwordMatches = await bcrypt.compare(password, user.password); // Compare passwords
    console.log('Password matches:', passwordMatches);

    if (!passwordMatches) {
        return res.status(401).json({ message: 'Invalid credentials' }); // Changed to JSON
    }

    if (passwordMatches) {
        // Create JWT token with user data
        const accessToken = jwt.sign({
            id: user.id,
            name: user.name,
            surname: user.surname,
            role: user.role,
        }, ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        // FOR API: Return JSON instead of redirect
        res.json({
            message: 'Login successful',
            token: accessToken,
            user: {
                id: user.id,
                name: user.name,
                surname: user.surname,
                role: user.role
            }
        });

        // OLD CODE (for web app):
        // res.cookie('accessToken', accessToken, { httpOnly: true });
        // res.redirect('/users/' + user.id);
    }
}

// Middleware: verify JWT from cookies
function authenticateJWT(req, res, next) {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.redirect('/auth/login'); // Redirect if no token
    }

    if (token) {
        console.log("authenticateJWT");
        jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.redirect('/auth/login'); // Redirect if token is invalid/expired
            }
            req.user = user; // Attach user data to request
            next(); // Continue to next middleware/route
        });
    }
}

module.exports = { authenticateUser, authenticateJWT };