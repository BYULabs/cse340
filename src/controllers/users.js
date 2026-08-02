import bcrypt from 'bcrypt';
import { createUser, authenticateUser, getAllUsers } from '../models/users.js';
import { getProjectsByVolunteerId } from '../models/projects.js';

// Number of salt rounds for bcrypt hashing
const SALT_ROUNDS = 10;

/**
 * Middleware to protect routes that require authentication.
 * Checks if the user is logged in via session.
 */
const requireLogin = (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.flash('error', 'You must be logged in to access that page.');
        return res.redirect('/login');
    }
    next();
};

/**
 * Middleware factory to require specific role for route access.
 * Returns middleware that checks if user has the required role.
 * 
 * @param {string} role - The role name required (e.g., 'admin', 'user')
 * @returns {Function} Express middleware function
 */
const requireRole = (role) => {
    return (req, res, next) => {
        // Check if user is logged in first
        if (!req.session || !req.session.user) {
            req.flash('error', 'You must be logged in to access this page.');
            return res.redirect('/login');
        }

        if (req.session.user.role_name !== role) {
            req.flash('error', 'You do not have permission to access this page.');
            return res.redirect('/');
        }

        // User has required role, continue
        next();
    };
};

/**
 * Renders the user dashboard view with user details and volunteered projects.
 */
const showDashboard = async (req, res, next) => {
    try {
        const user = req.session.user;

        // Fetch projects the logged-in user has signed up to volunteer for
        const volunteeredProjects = await getProjectsByVolunteerId(user.user_id);

        res.render('dashboard', { 
            title: 'Dashboard',
            page: 'dashboard',
            name: user.name,
            email: user.email,
            user,
            volunteeredProjects
        });
    } catch (error) {
        console.error("Error loading dashboard:", error);
        next(error);
    }
};

/**
 * Renders the user registration form view.
 */
const showUserRegistrationForm = async (req, res) => {
    res.render('register', { 
        title: 'Register New Account', 
        page: 'register' 
    });
};

/**
 * Handles processing of the registration form submission.
 * Hashes the user password and persists the new account to the database.
 */
const processUserRegistrationForm = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            req.flash('error', 'All fields are required.');
            return res.redirect('/register');
        }

        // Hash the plain text password securely
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Save the new user record (defaults to "user" / "Volunteer" role in model)
        const userId = await createUser(name, email, passwordHash);

        req.flash('success', 'Registration successful! You can now log in.');
        res.redirect('/login');
    } catch (error) {
        console.error("Error processing user registration:", error);

        // Check for unique key violation on email (PostgreSQL error code 23505)
        if (error.code === '23505') {
            req.flash('error', 'An account with that email address already exists.');
            return res.redirect('/register');
        }

        res.status(500).send(`Database Error: ${error.message}`);
    }
};

/**
 * Renders the login form view.
 */
const showLoginForm = (req, res) => {
    res.render('login', { 
        title: 'Login',
        page: 'login' 
    });
};

/**
 * Handles processing of the login form submission.
 */
const processLoginForm = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await authenticateUser(email, password);

        if (user) {
            // Store user object in session
            req.session.user = user;
            req.flash('success', 'Login successful!');

            // Log user for debugging purposes
            console.log('User logged in:', user);

            res.redirect('/dashboard');
        } else {
            // Authentication failed
            req.flash('error', 'Invalid email or password.');
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error during login:', error);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.redirect('/login');
    }
};

/**
 * Handles destroying the session and logging out the user.
 */
const processLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        req.flash('success', 'Logout successful!');
        res.redirect('/login');
    });
};

/**
 * Renders the users list view for admin users.
 */
const showUsersPage = async (req, res, next) => {
    try {
        const users = await getAllUsers();
        res.render('users', {
            title: 'Manage Users',
            page: 'users',
            users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        next(error);
    }
};

export {
    requireLogin,
    requireRole,
    showDashboard,
    showUsersPage,
    showUserRegistrationForm,
    processUserRegistrationForm,
    showLoginForm,
    processLoginForm,
    processLogout
};