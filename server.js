const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();

// ================= MIDDLEWARE =================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.use(session({
    secret: "whiteheartsecret",
    resave: false,
    saveUninitialized: true
}));

// ================= ADMIN LOGIN DETAILS =================
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "penny1974";

// ================= HELPER FUNCTION =================
function ensureDataFolder() {
    const dataFolder = path.join(__dirname, "data");
    if (!fs.existsSync(dataFolder)) {
        fs.mkdirSync(dataFolder);
    }
}

// ================= HOME PAGE =================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/home.html"));
});

// ================= ADMIN LOGIN PAGE =================
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "public/admin.html"));
});

// ================= LOGIN PROCESS =================
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.loggedIn = true;
        res.redirect("/dashboard");
    } else {
        res.send("Wrong Username or Password");
    }
});

// ================= DASHBOARD =================
app.get("/dashboard", (req, res) => {
    if (req.session.loggedIn) {
        res.sendFile(path.join(__dirname, "public/dashboard.html"));
    } else {
        res.redirect("/admin");
    }
});

// ================= EDIT HOME PAGE =================
app.post("/edit-home", (req, res) => {
    if (!req.session.loggedIn) return res.redirect("/admin");

    const newContent = req.body.content;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Whiteheart School</title>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        <h1>Whiteheart School (Montessori)</h1>
        <p>${newContent}</p>
        <a href="/admin">Admin</a>
    </body>
    </html>
    `;

    fs.writeFileSync(path.join(__dirname, "public/home.html"), html);
    res.send("Home Page Updated Successfully!");
});

// ================= ADMISSIONS =================
app.post("/apply", (req, res) => {

    ensureDataFolder();

    const newApplication = {
        studentName: req.body.studentName,
        age: req.body.age,
        class: req.body.class,
        parentName: req.body.parentName,
        phone: req.body.phone,
        date: new Date()
    };

    const filePath = path.join(__dirname, "data/applications.json");
    let applications = [];

    if (fs.existsSync(filePath)) {
        applications = JSON.parse(fs.readFileSync(filePath));
    }

    applications.push(newApplication);
    fs.writeFileSync(filePath, JSON.stringify(applications, null, 2));

    res.send("Application Submitted Successfully!");
});

// ================= VIEW APPLICATIONS =================
app.get("/applications", (req, res) => {

    if (!req.session.loggedIn) return res.redirect("/admin");

    const filePath = path.join(__dirname, "data/applications.json");
    let applications = [];

    if (fs.existsSync(filePath)) {
        applications = JSON.parse(fs.readFileSync(filePath));
    }

    let html = `<h2>Admission Applications</h2>
    <a href="/dashboard">Back to Dashboard</a><br><br>`;

    applications.forEach(app => {
        html += `
        <div style="border:1px solid #ccc; padding:15px; margin:15px;">
            <p><strong>Name:</strong> ${app.studentName}</p>
            <p><strong>Age:</strong> ${app.age}</p>
            <p><strong>Class:</strong> ${app.class}</p>
            <p><strong>Parent:</strong> ${app.parentName}</p>
            <p><strong>Phone:</strong> ${app.phone}</p>
            <p><strong>Date:</strong> ${new Date(app.date).toLocaleString()}</p>
        </div>
        `;
    });

    res.send(html);
});

// ================= CONTACT FORM =================
app.post("/send-message", (req, res) => {

    ensureDataFolder();

    const newMessage = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        message: req.body.message,
        date: new Date()
    };

    const filePath = path.join(__dirname, "data/messages.json");
    let messages = [];

    if (fs.existsSync(filePath)) {
        messages = JSON.parse(fs.readFileSync(filePath));
    }

    messages.push(newMessage);
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));

    res.send("Message Sent Successfully!");
});

// ================= VIEW MESSAGES =================
app.get("/messages", (req, res) => {

    if (!req.session.loggedIn) return res.redirect("/admin");

    const filePath = path.join(__dirname, "data/messages.json");
    let messages = [];

    if (fs.existsSync(filePath)) {
        messages = JSON.parse(fs.readFileSync(filePath));
    }

    let html = `<h2>Contact Messages</h2>
    <a href="/dashboard">Back to Dashboard</a><br><br>`;

    messages.forEach(msg => {
        html += `
        <div style="border:1px solid #ccc; padding:15px; margin:15px;">
            <p><strong>Name:</strong> ${msg.name}</p>
            <p><strong>Email:</strong> ${msg.email}</p>
            <p><strong>Phone:</strong> ${msg.phone || "Not Provided"}</p>
            <p><strong>Message:</strong> ${msg.message}</p>
            <p><strong>Date:</strong> ${new Date(msg.date).toLocaleString()}</p>
        </div>
        `;
    });

    res.send(html);
});

// ================= DYNAMIC PORT =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
