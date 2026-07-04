import db from './db.js'

const getAllProjects = async () => {
    const query = `
        SELECT project_id, title, description, location, project_date, organization_id
        FROM public.project;
    `;

    const result = await db.query(query);

    return result.rows;
}

export { getAllProjects }