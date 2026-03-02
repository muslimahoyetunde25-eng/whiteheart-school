const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// Admin credentials (in production use environment variables)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'password' // Change this in production
};

// Routes
app.get('/', (req, res) => {
    res.render(path.join(__dirname, 'views/home.html'));
});

app.get('/about', (req, res) => {
    res.render(path.join(__dirname, 'views/about.html'));
});

app.get('/programs', (req, res) => {
    res.render(path.join(__dirname, 'views/programs.html'));
});

app.get('/admissions', (req, res) => {
    res.render(path.join(__dirname, 'views/admissions.html'));
});

app.get('/gallery', (req, res) => {
    res.render(path.join(__dirname, 'views/gallery.html'));
});

app.get('/contact', (req, res) => {
    res.render(path.join(__dirname, 'views/contact.html'));
});

app.get('/admin', (req, res) => {
    res.render(path.join(__dirname, 'views/admin.html'));
});

// Admin Dashboard
app.get('/admin/dashboard', (req, res) => {
    const isAuthenticated = req.session.isAuthenticated;
    if (!isAuthenticated) {
        return res.redirect('/admin');
    }
    res.render(path.join(__dirname, 'views/dashboard.html'));
});

// Login route
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === ADMIN_CREDENTIALS.username && 
        password === ADMIN_CREDENTIALS.password) {
        req.session.isAuthenticated = true;
        res.redirect('/admin/dashboard');
    } else {
        res.status(401).send('Invalid credentials');
    }
});

// Logout route
app.post('/admin/logout', (req, res) => {
    req.session.isAuthenticated = false;
    res.redirect('/admin');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
