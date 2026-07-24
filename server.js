import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import session from 'express-session';
import flash from 'connect-flash';
import { testConnection } from './src/models/db.js';
import router from './src/routes.js';

const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Core Middleware & Assets ---

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session secret fallback intended for local development; override via ENV in production
app.use(session({
    secret: process.env.SESSION_SECRET || 'cse340-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));

app.use(flash());

/**
 * Exposes flash notification messages to EJS templates via res.locals.
 */
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

// --- View Engine Setup ---

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// --- Custom Middleware ---

/**
 * Logs HTTP request method and URL in development mode only.
 */
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        console.log(`${req.method} ${req.url}`);
    }
    next();
});

/**
 * Exposes application environment state to all view render contexts.
 */
app.use((req, res, next) => {
    res.locals.NODE_ENV = NODE_ENV;
    next();
});

// --- Application Routes ---

app.use(router);

// --- Error Handling Pipeline ---

/**
 * Catches unhandled routes and forwards a 404 error to the central handler.
 */
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

/**
 * Centralized application error handler for rendering 404 and 500 error pages.
 */
app.use((err, req, res, next) => {
    console.error('Error occurred:', err.message);
    if (NODE_ENV === 'development') {
        console.error('Stack trace:', err.stack);
    }
    
    const status = err.status || 500;
    const template = status === 404 ? '404' : '500';
    
    res.status(status).render(`errors/${template}`, {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        page: 'error',
        error: err.message,
        stack: NODE_ENV === 'development' ? err.stack : null
    });
});

// --- Server Initialization ---

app.listen(PORT, async () => {
    try {
        await testConnection();
        console.log(`Server running at http://127.0.0.1:${PORT}`);
        console.log(`Environment: ${NODE_ENV}`);
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
});