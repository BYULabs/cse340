import { body, validationResult } from 'express-validator';
import { 
    getUpcomingProjects, 
    getProjectDetails, 
    getProjectsByCategoryId,
    createProject 
} from '../models/projects.js';
import { getCategoriesByProjectId } from '../models/categories.js';
import { getAllOrganizations } from '../models/organizations.js';

// Configuration constant for the upcoming projects list
const NUMBER_OF_UPCOMING_PROJECTS = 5;

/**
 * Validation rules for new service project creation.
 */
const projectValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Project title is required.')
        .isLength({ min: 3, max: 200 })
        .withMessage('Project title must be between 3 and 200 characters.'),
    
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Project description is required.')
        .isLength({ max: 1000 })
        .withMessage('Project description cannot exceed 1000 characters.'),
    
    body('location')
        .trim()
        .notEmpty()
        .withMessage('Location is required.')
        .isLength({ max: 200 })
        .withMessage('Location cannot exceed 200 characters.'),
    
    body('date')
        .notEmpty()
        .withMessage('Project date is required.')
        .isISO8601()
        .withMessage('Please provide a valid date format.'),
    
    body('organizationId')
        .notEmpty()
        .withMessage('Partner organization is required.')
        .isInt()
        .withMessage('Organization ID must be a valid integer.')
];

/**
 * Renders the page showing a limited number of upcoming service projects.
 */
const showProjectsPage = async (req, res, next) => {
    try {
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
        const title = 'Upcoming Service Projects';
        const page = 'projects';
        
        res.render('projects', { title, projects, page });
    } catch (error) {
        console.error("Error loading projects page:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

/**
 * Renders the details page for a single specific service project, including its categories.
 */
const showProjectDetailsPage = async (req, res, next) => {
    try {
        const { id } = req.params;

        const project = await getProjectDetails(id);

        if (!project) {
            return res.status(404).send('Service project not found.');
        }

        const categories = await getCategoriesByProjectId(id);

        const title = project.title;
        const page = 'project-details';

        res.render('project', { title, project, categories, page });
    } catch (error) {
        console.error("Error loading project details page:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

/**
 * Renders the form to create a new service project.
 */
const showNewProjectForm = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Create New Project';
        const page = 'new-project';

        res.render('new-project', { title, organizations, page });
    } catch (error) {
        console.error("Error loading new project form:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

/**
 * Handles submission of the new service project form.
 */
const processNewProjectForm = async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // Flash all error messages
            errors.array().forEach(error => {
                req.flash('error', error.msg);
            });
            // Redirect back to the form page
            return res.redirect('/new-project');
        }

        // Extract project details from submitted request body
        const { title, description, location, date, organizationId } = req.body;

        // Create the new project in the database using the model function
        await createProject(title, description, location, date, organizationId);

        // Set a success flash message for the user
        req.flash('success', 'Project created successfully!');

        // Redirect back to the main service projects page
        res.redirect('/projects');
    } catch (error) {
        console.error("Error processing new project form:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

// Export controller functions & validation rules
export {
    projectValidation,
    showProjectsPage,
    showProjectDetailsPage,
    showNewProjectForm,
    processNewProjectForm
};