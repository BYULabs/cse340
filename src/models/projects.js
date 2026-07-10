import db from './db.js'

const getAllProjects = async () => {
    const query = `
        SELECT 
            p.project_id, 
            p.title, 
            p.description, 
            p.location, 
            p.project_date, 
            p.organization_id,
            o.name AS organization_name
        FROM public.project p
        INNER JOIN public.organization o ON p.organization_id = o.organization_id;
    `;

    const result = await db.query(query);
    return result.rows;
}

export { getAllProjects }