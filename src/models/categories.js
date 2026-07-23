import db from './db.js'

/**
 * Retrieve all service categories from the database.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of category objects.
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
}

/**
 * Retrieve a single category by its ID.
 * @param {number|string} categoryId - The ID of the category.
 */
const getCategoryById = async (categoryId) => {
    const query = `
        SELECT category_id, name
        FROM public.category
        WHERE category_id = $1;
    `;

    try {
        const queryParams = [categoryId];
        const result = await db.query(query, queryParams);
        
        // Return the category object if found, otherwise return null
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error("Data Layer Error [getCategoryById]:", error.message);
        throw new Error("Unable to retrieve category details at this time.");
    }
};

/**
 * Retrieve all categories mapped to a specific service project.
 * @param {number|string} projectId - The ID of the project.
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
        const queryParams = [projectId];
        const result = await db.query(query, queryParams);
        return result.rows;
    } catch (error) {
        console.error("Data Layer Error [getCategoriesByProjectId]:", error.message);
        throw new Error("Unable to retrieve categories for this project at this time.");
    }
};

/**
 * Assign a single category to a project in the join table.
 * @param {number|string} projectId - The ID of the project.
 * @param {number|string} categoryId - The ID of the category to assign.
 */
const assignCategoryToProject = async (projectId, categoryId) => {
    const query = `
        INSERT INTO public.project_category (project_id, category_id)
        VALUES ($1, $2);
    `;

    try {
        const queryParams = [projectId, categoryId];
        await db.query(query, queryParams);
    } catch (error) {
        console.error("Data Layer Error [assignCategoryToProject]:", error.message);
        throw new Error("Unable to assign category to project.");
    }
};

/**
 * Update the category assignments for a given project by removing old ones
 * and re-assigning the new list of categories.
 * @param {number|string} projectId - The ID of the project.
 * @param {Array<number|string>} categoryIds - Array of category IDs to assign.
 */
const updateCategoryAssignments = async (projectId, categoryIds) => {
    const deleteQuery = `
        DELETE FROM public.project_category
        WHERE project_id = $1;
    `;

    try {
        // Step 1: Remove existing assignments
        await db.query(deleteQuery, [projectId]);

        // Step 2: Insert new assignments using assignCategoryToProject
        for (const categoryId of categoryIds) {
            await assignCategoryToProject(projectId, categoryId);
        }
    } catch (error) {
        console.error("Data Layer Error [updateCategoryAssignments]:", error.message);
        throw new Error("Unable to update category assignments for this project.");
    }
};

// Export the model functions
export { 
    getAllCategories, 
    getCategoryById, 
    getCategoriesByProjectId,
    updateCategoryAssignments 
};