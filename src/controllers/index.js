export const showHomePage = async (req, res) => {
    res.render('home', { title: 'Home', page: 'home' });
};