require("dotenv").config({ path: "./.env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const homedir = require('os').homedir();
const fs = require('fs');
const path = require('path');
const { cronJob } = require("./utils/cronJob");
require("./controllers/weekSheet");
const app = express();

app.use(cors());
app.use(express.json({ limit: "30mb" }));

const APP_URL = process.env.APP_VERSION_URL

//directory names
const dir = "monnit";
const leaveapplications = path.join(homedir, dir, "leaveapplications");
const salarybreakups = path.join(homedir, dir, "salarybreakups");
const payslips = path.join(homedir, dir, "payslips");
const dailyreports = path.join(homedir, dir, "dailyreports");
const userdocuments = path.join(homedir, dir, "userdocuments");
const companyuploads = path.join(homedir, dir, "companyuploads");
const announcements = path.join(homedir, dir, "announcements");

//routers
app.use(`${APP_URL}/public`, require('./routes/publicRoutes'))
app.use(`${APP_URL}/api`, require('./routes/authRoute'))
app.use(`${APP_URL}/api`, require('./routes/employeeRoute'))
app.use(`${APP_URL}/api`, require('./routes/generalRoute'))
app.use(`${APP_URL}/api/admin`, require('./routes/adminRoute'))
app.use(`${APP_URL}/api/manager`, require('./routes/managerRoute'))
app.use(`${APP_URL}/api/hr`, require('./routes/hrRoute'))

const CONNECTION_URL = process.env.DB_URL;
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
    cronJob.start();
});

//stop server crashing even if db connection failed
process.on("unhandledRejection", (err, promise) => {
    console.log(`Logged Error: ${err}`);
    server.close(() => process.exit(1));
});

//db connection
mongoose
    .connect(CONNECTION_URL, {
        useNewUrlParser: true, useUnifiedTopology: true
    })
    .then(() => {
        console.log("DB connection successful");
        const io = require('./utils/socket').init(server, { cors: { origin: "*" } });
        io.on('connection', socket => {
            console.log("Connection Successful with socket id: " + socket.id);
        })
    })
    .catch((err) => {
        console.log(err);
    });




(async function () {
    try {
        if (!fs.existsSync(leaveapplications)) {
            fs.mkdirSync(leaveapplications, { recursive: true });
            console.log("- Leave Applications Directory created");
        }
        if (!fs.existsSync(salarybreakups)) {
            fs.mkdirSync(salarybreakups, { recursive: true });
            console.log("- Salary Breakups Directory created");
        }
        if (!fs.existsSync(payslips)) {
            fs.mkdirSync(payslips, { recursive: true });
            console.log("- Pay Slips Directory created");
        }
        if (!fs.existsSync(dailyreports)) {
            fs.mkdirSync(dailyreports, { recursive: true });
            console.log("- Daily Reports Directory created");
        }
        if (!fs.existsSync(userdocuments)) {
            fs.mkdirSync(userdocuments, { recursive: true });
            console.log("- User Documents Directory created");
        }
        if (!fs.existsSync(companyuploads)) {
            fs.mkdirSync(companyuploads, { recursive: true });
            console.log(" - Company Documents Upload Directory created");
        }
        if (!fs.existsSync(announcements)) {
            fs.mkdirSync(announcements, { recursive: true });
            console.log(" - Announcements Document Upload Directory created");
        }

    } catch (error) {
        console.log(error);
    }
})();