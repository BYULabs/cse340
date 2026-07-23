import db from './db.js'

/**
 * Retrieve all service projects from the database, including organization names.
 */
const getAllProjects = async () => {
    const query = `
        SELECT 
            p.project_id, 
            p.title, 
            p.description, 
            p.location, 
            p.project_date, 
            p.organization_id,
            o.name AS organization_name
        FROM public.project p
        INNER JOIN public.organization o ON p.organization_id = o.organization_id;
    `;

    try {
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error("Data Layer Error [getAllProjects]:", error.message);
        throw new Error("Unable to retrieve project listings at this time.");
    }
}

/**
 * Retrieve projects associated with a specific organization.
 */
const getProjectsByOrganizationId = async (organizationId) => {
    const query = `
        SELECT
            project_id,
            organization_id,
            title,
            description,
            location,
            project_date
        FROM project
        WHERE organization_id = $1
        ORDER BY project_date;
    `;
    
    try {
        const queryParams = [organizationId];
        const result = await db.query(query, queryParams);
        return result.rows;
    } catch (error) {
        console.error("Data Layer Error [getProjectsByOrganizationId]:", error.message);
        throw new Error("Unable to retrieve projects for this organization at this time.");
    }
};

/**
 * Retrieve a specific number of upcoming service projects starting from today.
 * @param {number} numberOfProjects - The maximum number of projects to retrieve.
 */
const getUpcomingProjects = async (numberOfProjects) => {
    const query = `
        SELECT 
            p.project_id, 
            p.title, 
            p.description, 
            p.project_date AS date, 
            p.location, 
            p.organization_id,
            o.name AS organization_name
        FROM public.project p
        INNER JOIN public.organization o ON p.organization_id = o.organization_id
        WHERE p.project_date >= CURRENT_DATE
        ORDER BY p.project_date ASC
        LIMIT $1;
    `;

    try {
        const queryParams = [numberOfProjects];
        const result = await db.query(query, queryParams);
        return result.rows;
    } catch (error) {
        console.error("Data Layer Error [getUpcomingProjects]:", error.message);
        throw new Error("Unable to retrieve upcoming projects at this time.");
    }
}

/**
 * Retrieve the details of a single service project by its ID.
 * @param {number|string} id - The ID of the service project.
 */
const getProjectDetails = async (id) => {
    const query = `
        SELECT 
            p.project_id, 
            p.title, 
            p.description, 
            p.project_date AS date, 
            p.location, 
            p.organization_id,
            o.name AS organization_name
        FROM public.project p
        INNER JOIN public.organization o ON p.organization_id = o.organization_id
        WHERE p.project_id = $1;
    `;

    try {
        const queryParams = [id];
        const result = await db.query(query, queryParams);

        // Return the project object if found, otherwise return null
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error("Data Layer Error [getProjectDetails]:", error.message);
        throw new Error("Unable to retrieve project details at this time.");
    }
};

/**
 * Retrieve all service projects associated with a given category.
 * @param {number|string} categoryId - The ID of the category.
 */
const getProjectsByCategoryId = async (categoryId) => {
    const query = `
        SELECT 
            p.project_id, 
            p.title, 
            p.description, 
            p.location, 
            p.project_date, 
            p.organization_id,
            o.name AS organization_name
        FROM public.project p
        INNER JOIN public.organization o ON p.organization_id = o.organization_id
        INNER JOIN public.project_category pc ON p.project_id = pc.project_id
        WHERE pc.category_id = $1
        ORDER BY p.project_date DESC;
    `;

    try {
        const queryParams = [categoryId];
        const result = await db.query(query, queryParams);
        return result.rows;
    } catch (error) {
        console.error("Data Layer Error [getProjectsByCategoryId]:", error.message);
        throw new Error("Unable to retrieve projects for this category at this time.");
    }
};

/**
 * Create a new service project in the database.
 * @param {string} title
 * @param {string} description
 * @param {string} location
 * @param {string|Date} date
 * @param {number|string} organizationId
 * @returns {Promise<number|string>} The ID of the newly created project.
 */
const createProject = async (title, description, location, date, organizationId) => {
    const query = `
        INSERT INTO public.project (title, description, location, project_date, organization_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING project_id;
    `;

    try {
        const queryParams = [title, description, location, date, organizationId];
        const result = await db.query(query, queryParams);
        
        // Return the ID of the newly inserted project
        return result.rows[0].project_id;
    } catch (error) {
        console.error("Data Layer Error [createProject]:", error.message);
        throw new Error("Unable to create new project at this time.");
    }
};

// Export the model functions
export { 
    getAllProjects, 
    getProjectsByOrganizationId, 
    getUpcomingProjects, 
    getProjectDetails,
    getProjectsByCategoryId,
    createProject
};