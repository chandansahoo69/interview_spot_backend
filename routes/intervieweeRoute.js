import express from "express";
import {
  acceptInterview,
  completedInterview,
  completedInterviewForInterviewee,
  getIntervieweeName,
  getInterviewerBookedSlot,
  getInterviewerName,
  intervieweeProfile,
  interviewerProfile,
  pendingInterview,
  pendingInterviewForInterviewee,
  rejectInterview,
  scheduleInterview,
  scheduledInterview,
  scheduledInterviewForInterviewee,
  updateProfile,
  welcome,
} from "../controllers/auth.js";
import verifyToken from "../middleware/authenticate.js";

const router = express.Router();

router.get("/pendingInterview-interviewee", pendingInterviewForInterviewee);
router.get("/completedInterview-interviewee", completedInterviewForInterviewee);
router.get("/scheduledInterview-interviewee", scheduledInterviewForInterviewee);
router.get("/interviewer-name", getInterviewerName);
router.post("/interviewer-slot", getInterviewerBookedSlot);

export default router;
