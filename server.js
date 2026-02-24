const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();

// MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Needed for JSON POST from admissions page
app.use(express.static("public"));

app.use(session({
    secret: "whiteheartsecret",
    resave: false,
    saveUninitialized: true
}));

// ADMIN LOGIN DETAILS
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "12345";

// HOME PAGE
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/home.html"));
});

// ADMIN LOGIN PAGE
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "public/admin.html"));
});

// LOGIN PROCESS
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.loggedIn = true;
        res.redirect("/dashboard");
    } else {
        res.send("Wrong Username or Password");
    }
});

// DASHBOARD
app.get("/dashboard", (req, res) => {
    if (req.session.loggedIn) {
        res.sendFile(path.join(__dirname, "public/dashboard.html"));
    } else {
        res.redirect("/admin");
    }
});

// EDIT HOME PAGE CONTENT
app.post("/edit-home", (req, res) => {
    if (req.session.loggedIn) {
        const newContent = req.body.content;

        const html = `
        <h1>Whiteheart School (Montessori)</h1>
        <p>${newContent}</p>
        <a href="/admin">Admin</a>
        `;

        fs.writeFileSync(path.join(__dirname, "public/home.html"), html);
        res.send("Home Page Updated Successfully!");
    } else {
        res.redirect("/admin");
    }
});

// ---------------------------------------
// ADMISSIONS FORM HANDLER
// ---------------------------------------
app.post("/apply", (req, res) => {
    const newApplication = {
        studentName: req.body.studentName,
        age: req.body.age,
        class: req.body.class,
        parentName: req.body.parentName,
        phone: req.body.phone,
        date: new Date()
    };

    const dataFolder = path.join(__dirname, "data");
    if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder);

    const filePath = path.join(dataFolder, "applications.json");
    let applications = [];

    if (fs.existsSync(filePath)) {
        applications = JSON.parse(fs.readFileSync(filePath));
    }

    applications.push(newApplication);
    fs.writeFileSync(filePath, JSON.stringify(applications, null, 2));

    res.status(200).send("Success");
});

// VIEW ADMISSION APPLICATIONS (ADMIN ONLY)
app.get("/applications", (req, res) => {
    if (req.session.loggedIn) {
        const filePath = path.join(__dirname, "data/applications.json");
        let applications = [];

        if (fs.existsSync(filePath)) {
            applications = JSON.parse(fs.readFileSync(filePath));
        }

        let html = `
        <h2>Admission Applications</h2>
        <a href="/dashboard">Back to Dashboard</a>
        <div style="margin-top:20px;">
        `;

        applications.forEach(app => {
            html += `
            <div style="border:1px solid #ccc; padding:10px; margin:10px;">
                <p><strong>Name:</strong> ${app.studentName}</p>
                <p><strong>Age:</strong> ${app.age}</p>
                <p><strong>Class:</strong> ${app.class}</p>
                <p><strong>Parent:</strong> ${app.parentName}</p>
                <p><strong>Phone:</strong> ${app.phone}</p>
                <p><strong>Date:</strong> ${new Date(app.date).toLocaleString()}</p>
            </div>
            `;
        });

        html += "</div>";
        res.send(html);

    } else {
        res.redirect("/admin");
    }
});

// ---------------------------------------
// DYNAMIC PORT FOR RENDER
// ---------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});