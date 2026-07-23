import { 
    getAllCategories, 
    getCategoryById, 
    getCategoriesByProjectId, 
    updateCategoryAssignments 
} from '../models/categories.js';
import { getProjectsByCategoryId, getProjectDetails } from '../models/projects.js';

const showCategoriesPage = async (req, res) => {
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
const showCategoryDetailsPage = async (req, res, next) => {
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

/**
 * Displays the form to assign categories to a project.
 */
// ✅ FIXED
const showAssignCategoriesForm = async (req, res, next) => {
    try {
        const { projectId } = req.params;

        const project = await getProjectDetails(projectId);
        const allCategories = await getAllCategories();
        const assignedCategories = await getCategoriesByProjectId(projectId);

        const title = 'Assign Categories to Project';
        const page = 'categories'; // Add page variable

        res.render('assign-categories', {
            title,
            project,
            allCategories,
            assignedCategories,
            page // Pass page here
        });
    } catch (error) {
        console.error("Error displaying assign categories form:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

/**
 * Processes the assignment of categories to a project.
 */
const processAssignCategoriesForm = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        
        // Handle case where no categories are selected (falls back to an empty array)
        const categories = req.body.categories || [];

        // Ensure categoryIds is an array (convert single value to array if necessary)
        const categoryIds = Array.isArray(categories) ? categories : [categories];

        // Update the category assignments in the database
        await updateCategoryAssignments(projectId, categoryIds);

        // Set flash message (assuming express-flash or req.flash middleware is configured)
        if (req.flash) {
            req.flash('success', 'Categories updated successfully.');
        }

        // Redirect back to project details page
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error("Error processing category assignments:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

// Export controller functions
export {
    showCategoriesPage,
    showCategoryDetailsPage,
    showAssignCategoriesForm,
    processAssignCategoriesForm
};