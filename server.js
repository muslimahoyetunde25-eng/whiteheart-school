const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

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

// ================= ENSURE DATA + VIDEO FOLDERS =================
function ensureFolders() {
    const dataFolder = path.join(__dirname, "data");
    const videoFolder = path.join(__dirname, "public/videos");

    if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder);
    if (!fs.existsSync(videoFolder)) fs.mkdirSync(videoFolder, { recursive: true });
}

// ================= VIDEO STORAGE CONFIG =================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/videos");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

// ================= HOME PAGE =================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/home.html"));
});

// ================= ADMIN LOGIN =================
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "public/admin.html"));
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.loggedIn = true;
        res.redirect("/dashboard");
    } else {
        res.send("Wrong Username or Password");
    }
});

app.get("/dashboard", (req, res) => {
    if (!req.session.loggedIn) return res.redirect("/admin");
    res.sendFile(path.join(__dirname, "public/dashboard.html"));
});

// ================= VIDEO UPLOAD =================
app.post("/upload-video", upload.single("video"), (req, res) => {
    if (!req.session.loggedIn) return res.redirect("/admin");

    ensureFolders();
    res.send("Video Uploaded Successfully!");
});

// ================= GET ALL VIDEOS =================
app.get("/videos-list", (req, res) => {
    ensureFolders();

    const videoFolder = path.join(__dirname, "public/videos");
    const files = fs.readdirSync(videoFolder);

    const videos = files.filter(file =>
        file.endsWith(".mp4") ||
        file.endsWith(".mov") ||
        file.endsWith(".webm")
    );

    res.json(videos);
});

// ================= ADMISSIONS =================
app.post("/apply", (req, res) => {

    ensureFolders();

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

// ================= CONTACT FORM =================
app.post("/send-message", (req, res) => {

    ensureFolders();

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

// ================= DYNAMIC PORT =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
