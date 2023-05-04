import express from "express";
import {
  acceptInterview,
  completedInterview,
  completedInterviewForInterviewee,
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

export default router;
