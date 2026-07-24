import { body, validationResult } from 'express-validator';
import { 
    getUpcomingProjects, 
    getProjectDetails, 
    getProjectsByCategoryId,
    createProject,
    updateProject
} from '../models/projects.js';
import { getCategoriesByProjectId } from '../models/categories.js';
import { getAllOrganizations } from '../models/organizations.js';

// Max items rendered on the landing view
const NUMBER_OF_UPCOMING_PROJECTS = 5;

/**
 * Validation schema for creating/updating a service project.
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
 * Renders the primary landing view listing upcoming projects.
 */
const showProjectsPage = async (req, res, next) => {
    try {
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
        res.render('projects', { title: 'Upcoming Service Projects', projects, page: 'projects' });
    } catch (error) {
        console.error("Error loading projects page:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

/**
 * Renders detail view for a specific project along with associated categories.
 */
const showProjectDetailsPage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const project = await getProjectDetails(id);

        if (!project) {
            return res.status(404).send('Service project not found.');
        }

        const categories = await getCategoriesByProjectId(id);
        res.render('project', { title: project.title, project, categories, page: 'project-details' });
    } catch (error) {
        console.error("Error loading project details page:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

/**
 * Renders the project creation form populated with available organizations.
 */
const showNewProjectForm = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        res.render('new-project', { title: 'Create New Project', organizations, page: 'new-project' });
    } catch (error) {
        console.error("Error loading new project form:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

/**
 * Handles creation of a new project after validation passes.
 */
const processNewProjectForm = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            errors.array().forEach(error => req.flash('error', error.msg));
            return res.redirect('/new-project');
        }

        const { title, description, location, date, organizationId } = req.body;
        await createProject(title, description, location, date, organizationId);

        req.flash('success', 'Project created successfully!');
        res.redirect('/projects');
    } catch (error) {
        console.error("Error processing new project form:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

/**
 * Renders edit form pre-filled with existing project details.
 */
const showEditProjectForm = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Fetch independent data dependencies concurrently to minimize round-trip latency
        const [project, organizations] = await Promise.all([
            getProjectDetails(id),
            getAllOrganizations()
        ]);

        if (!project) {
            return res.status(404).send('Service project not found.');
        }

        res.render('edit-project', { 
            title: `Edit ${project.title}`, 
            project, 
            organizations, 
            page: 'edit-project' 
        });
    } catch (error) {
        console.error("Error loading edit project form:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

/**
 * Handles updating an existing project after validation passes.
 */
const processEditProjectForm = async (req, res, next) => {
    try {
        const { id } = req.params;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            errors.array().forEach(error => req.flash('error', error.msg));
            return res.redirect(`/project/${id}/edit`);
        }

        const { title, description, location, date, organizationId } = req.body;
        await updateProject(id, title, description, location, date, organizationId);

        req.flash('success', 'Project updated successfully!');
        res.redirect(`/project/${id}`);
    } catch (error) {
        console.error("Error processing edit project form:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

export {
    projectValidation,
    showProjectsPage,
    showProjectDetailsPage,
    showNewProjectForm,
    processNewProjectForm,
    showEditProjectForm,
    processEditProjectForm
};