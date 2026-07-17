import { getUpcomingProjects, getProjectDetails, getProjectsByCategoryId } from '../models/projects.js';
import { getCategoriesByProjectId } from '../models/categories.js';

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
 * Renders the details page for a single specific service project, including its categories.
 */
export const showProjectDetailsPage = async (req, res, next) => {
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