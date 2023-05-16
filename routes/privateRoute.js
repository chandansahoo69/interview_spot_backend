import express from "express";
import {
  acceptInterview,
  completedInterview,
  getInterviewDetails,
  getIntervieweeName,
  intervieweeProfile,
  interviewerProfile,
  markInterviewAsCompleted,
  pendingFeedbacks,
  pendingInterview,
  postFeedback,
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
router.get("/pending-feedbacks", verifyToken, pendingFeedbacks);
router.post("/mark-interview-completed", verifyToken, markInterviewAsCompleted);
router.get("/scheduledInterview", verifyToken, scheduledInterview);
router.post("/acceptInterview", acceptInterview);
router.post("/rejectInterview", rejectInterview);
router.get("/interviewee-name", getIntervieweeName);
router.post("/interview-details", verifyToken, getInterviewDetails);
router.post("/post-feedback", verifyToken, postFeedback);

export default router;
