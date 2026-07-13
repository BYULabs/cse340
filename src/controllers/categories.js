import { getAllCategories } from '../models/categories.js'; 

export const showCategoriesPage = async (req, res) => {
    try {
        const categories = await getAllCategories();
        const title = 'Service Categories';
        const page = 'categories';

        res.render('categories', { title, categories, page });
    } catch (error) {
        console.error("Error loading categories page:", error);
        res.status(500).send(`Database Error: ${error.message}`);
    }
};