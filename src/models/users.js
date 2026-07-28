import db from './db.js';
import bcrypt from 'bcrypt';

/**
 * Inserts a new user record into the database and assigns them the default user role.
 * @param {string} name - Display name of the user.
 * @param {string} email - Unique contact email serving as username.
 * @param {string} passwordHash - Pre-hashed password string.
 * @returns {Promise<number|string>} Generated ID of the newly created user.
 */
const createUser = async (name, email, passwordHash) => {
    // Default role name to look up in the roles table
    const defaultRole = 'user';

    const query = `
        INSERT INTO public.users (name, email, password_hash, role_id) 
        VALUES (
            $1, 
            $2, 
            $3, 
            (SELECT role_id FROM public.roles WHERE role_name = $4)
        ) 
        RETURNING user_id;
    `;
    const queryParams = [name, email, passwordHash, defaultRole];

    try {
        const result = await db.query(query, queryParams);

        if (result.rows.length === 0) {
            throw new Error('No record returned post-insertion.');
        }

        return result.rows[0].user_id;
    } catch (error) {
        console.error("Data Layer Error [createUser]:", error.message);
        
        throw error;
    }
};

/**
 * Finds a user in the database by their email address.
 * Joins the roles table to include role_name instead of role_id.
 * @param {string} email 
 * @returns {Promise<Object|null>}
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT u.user_id, u.name, u.email, u.password_hash, r.role_name 
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = $1
    `;
    const queryParams = [email];
    
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        return null; // User not found
    }
    
    return result.rows[0];
};

/**
 * Compares a plain text password with a hashed password.
 * @param {string} password 
 * @param {string} passwordHash 
 * @returns {Promise<boolean>}
 */
const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

/**
 * Authenticates a user by email and password.
 * Removes the password_hash before returning the user object.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object|null>}
 */
const authenticateUser = async (email, password) => {
    // 1. Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
        return null;
    }

    // 2. Verify password
    const isMatch = await verifyPassword(password, user.password_hash);
    if (!isMatch) {
        return null;
    }

    // 3. Remove password_hash and return user object
    delete user.password_hash;
    return user;
};

// Export only createUser and authenticateUser as requested
export { createUser, authenticateUser };