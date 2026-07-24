import { 
    getAllOrganizations, 
    getOrganizationDetails, 
    createOrganization,
    updateOrganization 
} from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';
import { body, validationResult } from 'express-validator';

/**
 * Validation schema for creating/updating an organization.
 */
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

/**
 * Renders the primary landing view listing all partner organizations.
 */
const showOrganizationsPage = async (req, res) => {
    try {
        const organizations = await getAllOrganizations();
        res.render('organizations', { 
            title: 'Our Partner Organizations', 
            organizations, 
            page: 'organizations' 
        });
    } catch (error) {
        console.error("Error loading organizations page:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

/**
 * Renders detail view for a single organization and its associated projects.
 */
const showOrganizationDetailsPage = async (req, res) => {
    try {
        const organizationId = req.params.id;

        // Fetch organization details and related projects concurrently to reduce response latency
        const [organizationDetails, projects] = await Promise.all([
            getOrganizationDetails(organizationId),
            getProjectsByOrganizationId(organizationId)
        ]);

        if (!organizationDetails) {
            return res.status(404).send('Organization not found.');
        }

        res.render('organization', { 
            title: 'Organization Details', 
            organizationDetails, 
            projects, 
            page: 'organizations' 
        });
    } catch (error) {
        console.error("Error loading organization details page:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

/**
 * Renders the form to register a new partner organization.
 */
const showNewOrganizationForm = async (req, res) => {
    res.render('new-organization', { 
        title: 'Add New Organization', 
        page: 'organizations' 
    });
};

/**
 * Handles creation of a new organization after validation passes.
 */
const processNewOrganizationForm = async (req, res) => {
    try {
        const results = validationResult(req);

        if (!results.isEmpty()) {
            results.array().forEach(error => req.flash('error', error.msg));
            return res.redirect('/new-organization');
        }

        const { name, description, contactEmail } = req.body;

        // Default to system placeholder until image upload support is implemented
        const logoFilename = 'placeholder-logo.png'; 

        const organizationId = await createOrganization(name, description, contactEmail, logoFilename);

        req.flash('success', 'Organization added successfully!');
        res.redirect(`/organization/${organizationId}`);
    } catch (error) {
        console.error("Error processing new organization form:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

/**
 * Renders edit form pre-filled with existing organization details.
 */
const showEditOrganizationForm = async (req, res) => {
    try {
        const organizationId = req.params.id;
        const organizationDetails = await getOrganizationDetails(organizationId);

        if (!organizationDetails) {
            return res.status(404).send('Organization not found.');
        }

        res.render('edit-organization', { 
            title: 'Edit Organization', 
            organizationDetails, 
            page: 'organizations' 
        });
    } catch (error) {
        console.error("Error loading edit organization form:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

/**
 * Handles updating an existing organization after validation passes.
 */
const processEditOrganizationForm = async (req, res) => {
    try {
        const { id } = req.params;
        const results = validationResult(req);

        if (!results.isEmpty()) {
            results.array().forEach(error => req.flash('error', error.msg));
            return res.redirect(`/edit-organization/${id}`);
        }

        const { name, description, contactEmail, logoFilename } = req.body;
        await updateOrganization(id, name, description, contactEmail, logoFilename);

        req.flash('success', 'Organization updated successfully!');
        res.redirect(`/organization/${id}`);
    } catch (error) {
        console.error("Error processing edit organization form:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};

export {
    showOrganizationsPage,
    showOrganizationDetailsPage,
    showNewOrganizationForm,
    processNewOrganizationForm,
    showEditOrganizationForm,
    processEditOrganizationForm,
    organizationValidation
};