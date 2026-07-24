import db from './db.js';

/**
 * Retrieve all service categories ordered by name.
 * @returns {Promise<Array<Object>>} Resolved array of category record objects.
 */
const getAllCategories = async () => {
    const query = `
        SELECT category_id, name
        FROM public.category;
    `;

    try {
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error("Data Layer Error [getAllCategories]:", error.message);
        throw new Error("Unable to retrieve categories at this time.");
    }
};

/**
 * Retrieve a single category by its primary key.
 * @param {number|string} categoryId - Database ID of the target category.
 * @returns {Promise<Object|null>} Resolved category record or null if not found.
 */
const getCategoryById = async (categoryId) => {
    const query = `
        SELECT category_id, name
        FROM public.category
        WHERE category_id = $1;
    `;

    try {
        const result = await db.query(query, [categoryId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error("Data Layer Error [getCategoryById]:", error.message);
        throw new Error("Unable to retrieve category details at this time.");
    }
};

/**
 * Retrieve all categories linked to a specific service project.
 * @param {number|string} projectId - Database ID of the target project.
 * @returns {Promise<Array<Object>>} Resolved list of assigned categories.
 */
const getCategoriesByProjectId = async (projectId) => {
    const query = `
        SELECT c.category_id, c.name
        FROM public.category c
        INNER JOIN public.project_category pc ON c.category_id = pc.category_id
        WHERE pc.project_id = $1
        ORDER BY c.name;
    `;

    try {
        const result = await db.query(query, [projectId]);
        return result.rows;
    } catch (error) {
        console.error("Data Layer Error [getCategoriesByProjectId]:", error.message);
        throw new Error("Unable to retrieve categories for this project at this time.");
    }
};

/**
 * Creates a single project-to-category mapping entry in the join table.
 * @param {number|string} projectId - Target project ID.
 * @param {number|string} categoryId - Category ID to associate.
 * @returns {Promise<void>}
 */
const assignCategoryToProject = async (projectId, categoryId) => {
    const query = `
        INSERT INTO public.project_category (project_id, category_id)
        VALUES ($1, $2);
    `;

    try {
        await db.query(query, [projectId, categoryId]);
    } catch (error) {
        console.error("Data Layer Error [assignCategoryToProject]:", error.message);
        throw new Error("Unable to assign category to project.");
    }
};

/**
 * Replaces all current category associations for a project with a new set of IDs.
 * @param {number|string} projectId - Target project ID.
 * @param {Array<number|string>} categoryIds - List of new category IDs to assign.
 * @returns {Promise<void>}
 */
const updateCategoryAssignments = async (projectId, categoryIds) => {
    const deleteQuery = `
        DELETE FROM public.project_category
        WHERE project_id = $1;
    `;

    try {
        await db.query(deleteQuery, [projectId]);

        // Sequential insert loop utilized for low-volume tag arrays; consider bulk INSERT for high scale
        for (const categoryId of categoryIds) {
            await assignCategoryToProject(projectId, categoryId);
        }
    } catch (error) {
        console.error("Data Layer Error [updateCategoryAssignments]:", error.message);
        throw new Error("Unable to update category assignments for this project.");
    }
};

export { 
    getAllCategories, 
    getCategoryById, 
    getCategoriesByProjectId,
    assignCategoryToProject,
    updateCategoryAssignments 
};