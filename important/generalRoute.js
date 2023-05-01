const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const verifyAuth = require("../middleware/authenticate");

const { addAnnouncement, getAnnouncement, announcementRecords, announcementStatus } = require("../controllers/announcements");
const { notifications, readNotifications } = require("../controllers/notifications");
const { searchInfo } = require("../controllers/search");
const { getWeekSheets } = require("../controllers/weekSheet");
const { userTimeSheets, userWeekSheet, usersWeeklyTimesheets } = require("../controllers/timeSheet");
const { getDocumentTypes } = require("../controllers/documentType");

router.route("/add-announcements").post(verifyAuth, upload.array('announcementDocuments'), addAnnouncement);
router.route("/announcement-records").get(verifyAuth, announcementRecords);
router.route("/announcement-status").post(verifyAuth, announcementStatus);
router.route("/announcements").get(verifyAuth, getAnnouncement);
router.route("/notifications").get(verifyAuth, notifications);
router.route("/read-notifications").post(verifyAuth, readNotifications);
router.route("/search").get(verifyAuth, searchInfo);
router.route("/weeksheets").get(verifyAuth, getWeekSheets);
// router.route("/user-timesheets").post(verifyAuth, userTimeSheets);
router.route("/user-weeksheets").get(verifyAuth, userWeekSheet);
router.route("/user-weekly-timesheets").post(verifyAuth, usersWeeklyTimesheets);
router.route("/document-types").get(verifyAuth, getDocumentTypes);


module.exports = router;