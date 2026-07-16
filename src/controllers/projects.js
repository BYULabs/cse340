import { getUpcomingProjects, getProjectDetails } from '../models/projects.js';

// Configuration constant for the upcoming projects list
const NUMBER_OF_UPCOMING_PROJECTS = 5;

/**
 * Renders the page showing a limited number of upcoming service projects.
 */
export const showProjectsPage = async (req, res, next) => {
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
 * Renders the details page for a single specific service project.
 */
export const showProjectDetailsPage = async (req, res, next) => {
    try {
        // Extract the service project ID from the URL parameters
        const { id } = req.params;

        // Retrieve the service project details from the database
        const project = await getProjectDetails(id);

        // Optional: Handle the case if a project isn't found (e.g., 404 page)
        if (!project) {
            return res.status(404).send('Service project not found.');
        }

        const title = project.title; // Set page title dynamically to the project name
        const page = 'project-details'; // Unique page identifier for navigation highlighting if needed

        // Render the project.ejs view with the retrieved project data
        res.render('project', { title, project, page });
    } catch (error) {
        console.error("Error loading project details page:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};