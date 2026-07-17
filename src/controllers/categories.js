import { getAllCategories, getCategoryById } from '../models/categories.js';
import { getProjectsByCategoryId } from '../models/projects.js';

export const showCategoriesPage = async (req, res) => {
    try {
        const categories = await getAllCategories();
        const title = 'Service Categories';
        const page = 'categories';

        res.render('categories', { title, categories, page });
    } catch (error) {
        console.error("Error loading categories page:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

/**
 * Renders the details page for a single category, displaying all related service projects.
 */
export const showCategoryDetailsPage = async (req, res, next) => {
    try {
        // Extract the category ID from the URL parameters (e.g., /categories/:id)
        const { id } = req.params;

        // 1. Fetch the single category information
        const category = await getCategoryById(id);

        // Handle case where category ID doesn't exist
        if (!category) {
            return res.status(404).send('Category not found.');
        }

        // 2. Fetch all service projects tagged with this category
        const projects = await getProjectsByCategoryId(id);

        const title = `${category.name} Projects`; // Dynamic title based on category name
        const page = 'categories'; // Keeps the navigation active context on categories

        // 3. Render your category details view template (e.g., category.ejs)
        res.render('category', { title, category, projects, page });
    } catch (error) {
        console.error("Error loading category details page:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};