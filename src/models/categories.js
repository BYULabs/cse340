import db from './db.js'

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

export { getAllCategories }