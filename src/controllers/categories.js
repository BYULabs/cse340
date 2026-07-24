import { 
    getAllCategories, 
    getCategoryById, 
    getCategoriesByProjectId, 
    updateCategoryAssignments 
} from '../models/categories.js';
import { getProjectsByCategoryId, getProjectDetails } from '../models/projects.js';

/**
 * Renders the primary list view of all service categories.
 */
const showCategoriesPage = async (req, res) => {
    try {
        const categories = await getAllCategories();
        res.render('categories', { 
            title: 'Service Categories', 
            categories, 
            page: 'categories' 
        });
    } catch (error) {
        console.error("Error loading categories page:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

/**
 * Renders detail view for a specific category along with its tagged projects.
 */
const showCategoryDetailsPage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await getCategoryById(id);

        if (!category) {
            return res.status(404).send('Category not found.');
        }

        const projects = await getProjectsByCategoryId(id);

        res.render('category', { 
            title: `${category.name} Projects`, 
            category, 
            projects, 
            page: 'categories' 
        });
    } catch (error) {
        console.error("Error loading category details page:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

/**
 * Renders category management form for a project with both available and assigned categories.
 */
const showAssignCategoriesForm = async (req, res, next) => {
    try {
        const { projectId } = req.params;

        // Fetch independent project and category data concurrently to reduce database wait times
        const [project, allCategories, assignedCategories] = await Promise.all([
            getProjectDetails(projectId),
            getAllCategories(),
            getCategoriesByProjectId(projectId)
        ]);

        if (!project) {
            return res.status(404).send('Project not found.');
        }

        res.render('assign-categories', {
            title: 'Assign Categories to Project',
            project,
            allCategories,
            assignedCategories,
            page: 'categories'
        });
    } catch (error) {
        console.error("Error displaying assign categories form:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

/**
 * Handles updating category assignments for a given project.
 */
const processAssignCategoriesForm = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const rawCategories = req.body.categories || [];

        // Normalize express body output: unselected -> [], single selection -> array, multiple -> array
        const categoryIds = Array.isArray(rawCategories) ? rawCategories : [rawCategories];

        await updateCategoryAssignments(projectId, categoryIds);

        if (req.flash) {
            req.flash('success', 'Categories updated successfully.');
        }

        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error("Error processing category assignments:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

export {
    showCategoriesPage,
    showCategoryDetailsPage,
    showAssignCategoriesForm,
    processAssignCategoriesForm
};