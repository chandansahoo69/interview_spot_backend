const express = require("express");
const router = express.Router();
const path = require("path");
const homedir = require('os').homedir();
//directories
const dir = path.join(homedir, "monnit");
const userdocuments = path.join(dir, "userdocuments");
const companyuploads = path.join(dir, "companyuploads");
const leaveapplications = path.join(dir, "leaveapplications");
const salarybreakups = path.join(dir, "salarybreakups");
const payslips = path.join(dir, "payslips");
const dailyreports = path.join(dir, "dailyreports");
const announcements = path.join(dir, "announcements");

const { login } = require("../controllers/auth");
// const { paySlip } = require("../controllers/bank");

const salaryBreakups = (req, res) => {
    res.sendFile(path.join(salarybreakups, req.params.filename));
}
const paySlip = (req, res) => {
    res.sendFile(path.join(payslips, req.params.filename));
}
const leaveApplications = (req, res) => {
    res.sendFile(path.join(leaveapplications, req.params.filename));
}

const viewDocuments = (req, res) => {
    res.sendFile(path.join(userdocuments, req.params.filename));
}

const companyDocuments = (req, res) => {
    res.sendFile(path.join(companyuploads, req.params.filename));
}

const dailyReports = (req, res) => {
    res.sendFile(path.join(dailyreports, req.params.filename));
}

const announcementDocuments = (req, res) => {
    res.sendFile(path.join(announcements, req.params.filename));
}


router.route("/login").post(login);
router.route("/mysalary/:filename").get(salaryBreakups);
router.route("/payslip/:filename").get(paySlip);
router.route("/myleave/:filename").get(leaveApplications);
router.route("/user-document/:filename").get(viewDocuments);
router.route("/company-document/:filename").get(companyDocuments);
router.route("/daily-report/:filename").get(dailyReports);
router.route("/announcement/:filename").get(announcementDocuments);


module.exports = router;