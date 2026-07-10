import db from './db.js'

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
}

export { getAllOrganizations }