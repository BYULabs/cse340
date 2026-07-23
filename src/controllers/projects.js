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
 * Renders the page showing a limited number of upcoming service projects.
 */
const showProjectsPage = async (req, res, next) => {
    try {
        // Fetch only the upcoming projects based on our constant config
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

        // 1. Retrieve the service project details
        const project = await getProjectDetails(id);

        if (!project) {
            return res.status(404).send('Service project not found.');
        }

        // 2. Fetch the categories assigned to this specific project
        const categories = await getCategoriesByProjectId(id);

        const title = project.title;
        const page = 'project-details';

        // 3. Pass both 'project' and 'categories' to your view
        res.render('project', { title, project, categories, page });
    } catch (error) {
        console.error("Error loading project details page:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

/**
 * Renders the form to create a new service project.
 */
/**
 * Renders the form to create a new service project.
 */
const showNewProjectForm = async (req, res, next) => {
    try {
        // Fetch all organizations to populate the dropdown selection
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

// Export controller functions
export {
    showProjectsPage,
    showProjectDetailsPage,
    showNewProjectForm,
    processNewProjectForm
};