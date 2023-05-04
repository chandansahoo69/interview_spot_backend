import express from "express";
import {
  acceptInterview,
  completedInterview,
  intervieweeProfile,
  interviewerProfile,
  pendingInterview,
  rejectInterview,
  scheduleInterview,
  scheduledInterview,
  updateProfile,
  welcome,
} from "../controllers/auth.js";
import verifyToken from "../middleware/authenticate.js";

const router = express.Router();

router.post("/updateProfile", updateProfile);
router.get("/interviewer/:id", verifyToken, interviewerProfile);
router.get("/interviewee/:id", verifyToken, intervieweeProfile);
router.post("/scheduleInterview", scheduleInterview);
// router.get("/interviewer/pendingInterview", pendingInterview);
router.get("/pendingInterview", pendingInterview);
router.get("/completedInterview", completedInterview);
router.get("/scheduledInterview", scheduledInterview);
router.post("/acceptInterview", acceptInterview);
router.post("/rejectInterview", rejectInterview);

export default router;
