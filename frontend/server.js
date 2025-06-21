// frontend/server.js (Using ES Module syntax)
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config'; // <-- NEW: Import dotenv/config for ES Modules

// Recreate __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Dynamically get the port from environment variables, or default to 5173
// process.env.PORT will now be populated by dotenv/config
//const port = process.env.PORT || 5173;

// TODO: Remove this after testing
const port = 5173;

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// For any other route (e.g., /dashboard, /match/xyz), serve the index.html.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Frontend production server listening on port ${port}`);
    console.log(`Serving static files from: ${path.join(__dirname, 'dist')}`);
    console.log(`Frontend server using PORT: ${port} from environment variables.`); // Added log
});
