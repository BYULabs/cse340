import { 
    getAllCategories, 
    getCategoryById, 
    getCategoriesByProjectId, 
    updateCategoryAssignments,
    createCategory,
    updateCategory 
} from '../models/categories.js';
import { getProjectsByCategoryId, getProjectDetails } from '../models/projects.js';
import { body, validationResult } from 'express-validator';

/**
 * Validation rules for creating/updating a category.
 */
const categoryValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Category name is required.')
        .isLength({ min: 2, max: 100 })
        .withMessage('Category name must be between 2 and 100 characters.')
];

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

/**
 * Renders the form to create a new category.
 */
const showNewCategoryForm = async (req, res) => {
    res.render('new-category', { 
        title: 'Create New Category', 
        page: 'categories' 
    });
};

/**
 * Handles submission of the new category form.
 */
const processNewCategoryForm = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            errors.array().forEach(error => req.flash('error', error.msg));
            return res.redirect('/new-category');
        }

        const { name } = req.body;
        const categoryId = await createCategory(name);

        req.flash('success', 'Category created successfully!');
        res.redirect(`/category/${categoryId}`);
    } catch (error) {
        console.error("Error processing new category form:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

/**
 * Renders the form to edit an existing category.
 */
const showEditCategoryForm = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await getCategoryById(id);

        if (!category) {
            return res.status(404).send('Category not found.');
        }

        res.render('edit-category', { 
            title: `Edit ${category.name}`, 
            category, 
            page: 'categories' 
        });
    } catch (error) {
        console.error("Error loading edit category form:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

/**
 * Handles submission of the edit category form.
 */
const processEditCategoryForm = async (req, res) => {
    try {
        const { id } = req.params;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            errors.array().forEach(error => req.flash('error', error.msg));
            return res.redirect(`/edit-category/${id}`);
        }

        const { name } = req.body;
        await updateCategory(id, name);

        req.flash('success', 'Category updated successfully!');
        res.redirect(`/category/${id}`);
    } catch (error) {
        console.error("Error processing edit category form:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

export {
    showCategoriesPage,
    showCategoryDetailsPage,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm,
    categoryValidation
};