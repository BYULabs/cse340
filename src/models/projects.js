import db from './db.js';

/**
 * Retrieve all service projects along with their parent organization names.
 * @returns {Promise<Array<Object>>} Resolved list of all project records.
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
};

/**
 * Retrieve projects associated with a specific organization.
 * @param {number|string} organizationId - Database ID of the target organization.
 * @returns {Promise<Array<Object>>} Resolved list of matching project records.
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
        FROM public.project
        WHERE organization_id = $1
        ORDER BY project_date;
    `;

    try {
        const result = await db.query(query, [organizationId]);
        return result.rows;
    } catch (error) {
        console.error("Data Layer Error [getProjectsByOrganizationId]:", error.message);
        throw new Error("Unable to retrieve projects for this organization at this time.");
    }
};

/**
 * Retrieve a limited set of upcoming service projects starting from today.
 * @param {number} numberOfProjects - Maximum number of records to return.
 * @returns {Promise<Array<Object>>} Resolved list of upcoming projects.
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
        const result = await db.query(query, [numberOfProjects]);
        return result.rows;
    } catch (error) {
        console.error("Data Layer Error [getUpcomingProjects]:", error.message);
        throw new Error("Unable to retrieve upcoming projects at this time.");
    }
};

/**
 * Retrieve a single service project by its primary key.
 * @param {number|string} id - Database ID of the target project.
 * @returns {Promise<Object|null>} Resolved project object or null if not found.
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
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error("Data Layer Error [getProjectDetails]:", error.message);
        throw new Error("Unable to retrieve project details at this time.");
    }
};

/**
 * Retrieve all service projects associated with a given category.
 * @param {number|string} categoryId - Database ID of the target category.
 * @returns {Promise<Array<Object>>} Resolved list of category-tagged projects.
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
        const result = await db.query(query, [categoryId]);
        return result.rows;
    } catch (error) {
        console.error("Data Layer Error [getProjectsByCategoryId]:", error.message);
        throw new Error("Unable to retrieve projects for this category at this time.");
    }
};

/**
 * Inserts a new service project and returns its generated ID.
 * @param {string} title - Project header title.
 * @param {string} description - Detailed project content.
 * @param {string} location - Physical or virtual location.
 * @param {string|Date} date - Scheduled date.
 * @param {number|string} organizationId - Associated partner organization ID.
 * @returns {Promise<number|string>} Generated ID of the new project.
 */
const createProject = async (title, description, location, date, organizationId) => {
    const query = `
        INSERT INTO public.project (title, description, location, project_date, organization_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING project_id;
    `;

    try {
        const result = await db.query(query, [title, description, location, date, organizationId]);
        return result.rows[0].project_id;
    } catch (error) {
        console.error("Data Layer Error [createProject]:", error.message);
        throw new Error("Unable to create new project at this time.");
    }
};

/**
 * Updates details for an existing service project record.
 * @param {number|string} id - Database ID of the project to update.
 * @param {string} title - Updated title.
 * @param {string} description - Updated summary.
 * @param {string} location - Updated location.
 * @param {string|Date} date - Updated date.
 * @param {number|string} organizationId - Updated organization ID.
 * @returns {Promise<Object>} Updated project row data.
 */
const updateProject = async (id, title, description, location, date, organizationId) => {
    const query = `
        UPDATE public.project
        SET 
            title = $1,
            description = $2,
            location = $3,
            project_date = $4,
            organization_id = $5
        WHERE project_id = $6
        RETURNING project_id;
    `;

    try {
        const result = await db.query(query, [title, description, location, date, organizationId, id]);

        if (result.rows.length === 0) {
            throw new Error(`Project with ID ${id} not found.`);
        }

        return result.rows[0];
    } catch (error) {
        console.error("Data Layer Error [updateProject]:", error.message);
        throw new Error("Unable to update project at this time.");
    }
};

/**
 * Adds a user as a volunteer to a specific project.
 * @param {number|string} userId - Database ID of the volunteering user.
 * @param {number|string} projectId - Database ID of the target project.
 * @returns {Promise<Object>} The newly created project_volunteer record.
 */
const addVolunteerToProject = async (userId, projectId) => {
    const query = `
        INSERT INTO public.project_volunteer (user_id, project_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, project_id) DO NOTHING
        RETURNING user_id, project_id, signup_date;
    `;

    try {
        const result = await db.query(query, [userId, projectId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error("Data Layer Error [addVolunteerToProject]:", error.message);
        throw new Error("Unable to register volunteer for this project at this time.");
    }
};

/**
 * Removes a user's volunteer registration from a specific project.
 * @param {number|string} userId - Database ID of the user.
 * @param {number|string} projectId - Database ID of the project to leave.
 * @returns {Promise<boolean>} True if a record was deleted, false otherwise.
 */
const removeVolunteerFromProject = async (userId, projectId) => {
    const query = `
        DELETE FROM public.project_volunteer
        WHERE user_id = $1 AND project_id = $2
        RETURNING user_id, project_id;
    `;

    try {
        const result = await db.query(query, [userId, projectId]);
        return result.rowCount > 0;
    } catch (error) {
        console.error("Data Layer Error [removeVolunteerFromProject]:", error.message);
        throw new Error("Unable to remove volunteer registration at this time.");
    }
};

/**
 * Retrieves all service projects a specific user has volunteered for,
 * including organization details and volunteer signup dates.
 * @param {number|string} userId - Database ID of the user.
 * @returns {Promise<Array<Object>>} List of volunteered project records.
 */
const getProjectsByVolunteerId = async (userId) => {
    const query = `
        SELECT 
            p.project_id, 
            p.title, 
            p.description, 
            p.location, 
            p.project_date, 
            p.organization_id,
            o.name AS organization_name,
            pv.signup_date
        FROM public.project_volunteer pv
        INNER JOIN public.project p ON pv.project_id = p.project_id
        INNER JOIN public.organization o ON p.organization_id = o.organization_id
        WHERE pv.user_id = $1
        ORDER BY p.project_date ASC;
    `;

    try {
        const result = await db.query(query, [userId]);
        return result.rows;
    } catch (error) {
        console.error("Data Layer Error [getProjectsByVolunteerId]:", error.message);
        throw new Error("Unable to retrieve volunteered projects for this user.");
    }
};

export { 
    getAllProjects, 
    getProjectsByOrganizationId, 
    getUpcomingProjects, 
    getProjectDetails,
    getProjectsByCategoryId,
    createProject,
    updateProject,
    addVolunteerToProject,
    removeVolunteerFromProject,
    getProjectsByVolunteerId
};