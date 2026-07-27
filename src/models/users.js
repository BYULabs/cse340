import db from './db.js';

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

export { createUser };