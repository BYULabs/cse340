import db from './db.js';

/**
 * Retrieve all partner organizations from the database.
 * @returns {Promise<Array<Object>>} Resolved array of organization record objects.
 */
const getAllOrganizations = async () => {
    const query = `
        SELECT organization_id, name, description, contact_email, logo_filename
        FROM public.organization;
    `;

    try {
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error("Data Layer Error [getAllOrganizations]:", error.message);
        throw new Error("Unable to retrieve organizations at this time.");
    }
};

/**
 * Retrieve a single organization by its primary key.
 * @param {number|string} organizationId - Database ID of the target organization.
 * @returns {Promise<Object|null>} Resolved organization record or null if not found.
 */
const getOrganizationDetails = async (organizationId) => {
    const query = `
        SELECT organization_id, name, description, contact_email, logo_filename
        FROM public.organization
        WHERE organization_id = $1;
    `;

    try {
        const result = await db.query(query, [organizationId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error("Data Layer Error [getOrganizationDetails]:", error.message);
        throw new Error("Unable to retrieve organization details at this time.");
    }
};

/**
 * Inserts a new organization record and returns its generated ID.
 * @param {string} name - Organization name.
 * @param {string} description - Brief summary of the organization.
 * @param {string} contactEmail - Primary email contact.
 * @param {string} logoFilename - Associated image asset filename.
 * @returns {Promise<number|string>} Generated ID of the new organization.
 */
const createOrganization = async (name, description, contactEmail, logoFilename) => {
    const query = `
        INSERT INTO public.organization (name, description, contact_email, logo_filename)
        VALUES ($1, $2, $3, $4)
        RETURNING organization_id;
    `;

    try {
        const result = await db.query(query, [name, description, contactEmail, logoFilename]);

        if (result.rows.length === 0) {
            throw new Error('No record returned post-insertion.');
        }

        // Conditional debug output for database auditing during development
        if (process.env.ENABLE_SQL_LOGGING === 'true') {
            console.log('Created new organization with ID:', result.rows[0].organization_id);
        }

        return result.rows[0].organization_id;
    } catch (error) {
        console.error("Data Layer Error [createOrganization]:", error.message);
        throw new Error("Unable to create organization at this time.");
    }
};

/**
 * Updates details for an existing organization record.
 * @param {number|string} id - Database ID of the target organization.
 * @param {string} name - Updated organization name.
 * @param {string} description - Updated summary.
 * @param {string} contactEmail - Updated email.
 * @param {string} logoFilename - Updated image asset filename.
 * @returns {Promise<Object>} Database query execution result.
 */
const updateOrganization = async (id, name, description, contactEmail, logoFilename) => {
    const query = `
        UPDATE public.organization
        SET name = $1,
            description = $2,
            contact_email = $3,
            logo_filename = $4
        WHERE organization_id = $5;
    `;

    try {
        return await db.query(query, [name, description, contactEmail, logoFilename, id]);
    } catch (error) {
        console.error("Data Layer Error [updateOrganization]:", error.message);
        throw new Error("Unable to update organization details at this time.");
    }
};

export { 
    getAllOrganizations, 
    getOrganizationDetails, 
    createOrganization,
    updateOrganization 
};