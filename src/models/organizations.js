import db from './db.js';

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
        
        throw new Error("Unable to retrieve organizations at this time. Please try again later.");
    }
};

const getOrganizationDetails = async (organizationId) => {
    const query = `
      SELECT
        organization_id,
        name,
        description,
        contact_email,
        logo_filename
      FROM organization
      WHERE organization_id = $1;
    `;

    const queryParams = [organizationId];
    const result = await db.query(query, queryParams);

    // Return the first row of the result set, or null if no rows are found
    return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Creates a new organization in the database.
 * @param {string} name - The name of the organization.
 * @param {string} description - A description of the organization.
 * @param {string} contactEmail - The contact email for the organization.
 * @param {string} logoFilename - The filename of the organization's logo.
 * @returns {string} The id of the newly created organization record.
 */
const createOrganization = async (name, description, contactEmail, logoFilename) => {
    const query = `
      INSERT INTO organization (name, description, contact_email, logo_filename)
      VALUES ($1, $2, $3, $4)
      RETURNING organization_id
    `;

    const queryParams = [name, description, contactEmail, logoFilename];
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to create organization');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new organization with ID:', result.rows[0].organization_id);
    }

    return result.rows[0].organization_id;
};

/**
 * Updates an existing organization in the database.
 * @param {number|string} id - The ID of the organization to update.
 * @param {string} name - The updated name.
 * @param {string} description - The updated description.
 * @param {string} contactEmail - The updated contact email.
 * @param {string} logoFilename - The updated logo filename.
 */
const updateOrganization = async (id, name, description, contactEmail, logoFilename) => {
    const query = `
        UPDATE organization
        SET name = $1,
            description = $2,
            contact_email = $3,
            logo_filename = $4
        WHERE organization_id = $5
    `;

    const queryParams = [name, description, contactEmail, logoFilename, id];
    return await db.query(query, queryParams);
};

// Export the model functions
export { 
    getAllOrganizations, 
    getOrganizationDetails, 
    createOrganization,
    updateOrganization 
};