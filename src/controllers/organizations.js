import { 
    getAllOrganizations, 
    getOrganizationDetails, 
    createOrganization,
    updateOrganization 
} from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';
import { body, validationResult } from 'express-validator';

// Define validation and sanitization rules for organization form
const organizationValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Organization name is required')
        .isLength({ min: 3, max: 150 })
        .withMessage('Organization name must be between 3 and 150 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Organization description is required')
        .isLength({ max: 500 })
        .withMessage('Organization description cannot exceed 500 characters'),
    body('contactEmail')
        .normalizeEmail()
        .notEmpty()
        .withMessage('Contact email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
];

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

    res.render('organization', { title, organizationDetails, projects, page });
};

const showNewOrganizationForm = async (req, res) => {
    const title = 'Add New Organization';
    const page = 'organizations'; // Highlight the "Organizations" link in header

    res.render('new-organization', { title, page });
};

const processNewOrganizationForm = async (req, res) => {
    // Check for validation errors
    const results = validationResult(req);
    if (!results.isEmpty()) {
        // Validation failed - loop through errors
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Redirect back to the new organization form
        return res.redirect('/new-organization');
    }

    const { name, description, contactEmail } = req.body;
    const logoFilename = 'placeholder-logo.png'; // Use the placeholder logo for all new organizations    

    const organizationId = await createOrganization(name, description, contactEmail, logoFilename);
    req.flash('success', 'Organization added successfully!');
    res.redirect(`/organization/${organizationId}`);
};

// Show Edit Organization Form
const showEditOrganizationForm = async (req, res) => {
    const organizationId = req.params.id;
    const organizationDetails = await getOrganizationDetails(organizationId);
    const title = 'Edit Organization';
    const page = 'organizations';

    res.render('edit-organization', { title, organizationDetails, page });
};

// Process Edit Organization Form Submission
const processEditOrganizationForm = async (req, res) => {
    // Check for validation errors first
    const results = validationResult(req);
    if (!results.isEmpty()) {
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        return res.redirect(`/edit-organization/${req.params.id}`);
    }

    // Get the organization ID from req.params.id
    const id = req.params.id;

    // Get the rest of the data from req.body
    const { name, description, contactEmail, logoFilename } = req.body;

    // Call updateOrganization model function
    await updateOrganization(id, name, description, contactEmail, logoFilename);

    // Set success flash message
    req.flash('success', 'Organization updated successfully!');

    // Redirect user back to the organization details page
    res.redirect(`/organization/${id}`);
};

// Export controller functions
export {
    showOrganizationsPage,
    showOrganizationDetailsPage,
    showNewOrganizationForm,
    processNewOrganizationForm,
    showEditOrganizationForm,
    processEditOrganizationForm,
    organizationValidation
};