const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
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

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});