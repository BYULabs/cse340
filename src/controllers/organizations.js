import { getAllOrganizations } from '../models/organizations.js';

export const showOrganizationsPage = async (req, res) => {
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