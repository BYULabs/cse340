import { getAllOrganizations, getOrganizationDetails } from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';

const showOrganizationsPage = async (req, res) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Our Partner Organizations';
        const page = 'organizations';

        res.render('organizations', { title, organizations, page });
    } catch (error) {
        console.error("Error loading organizations page:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

const showOrganizationDetailsPage = async (req, res) => {
    const organizationId = req.params.id;
    const organizationDetails = await getOrganizationDetails(organizationId);
    const projects = await getProjectsByOrganizationId(organizationId);
    const title = 'Organization Details';
    const page = 'organizations';


    res.render('organization', {title, organizationDetails, projects, page});
};

// Export any controller functions
export { showOrganizationsPage, showOrganizationDetailsPage };