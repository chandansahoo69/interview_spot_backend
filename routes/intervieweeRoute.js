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
  pendingFeedbacksForInterviewee,
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

router.get(
  "/pendingInterview-interviewee",
  verifyToken,
  pendingInterviewForInterviewee
);
router.get(
  "/completedInterview-interviewee",
  verifyToken,
  completedInterviewForInterviewee
);
router.get(
  "/scheduledInterview-interviewee",
  verifyToken,
  scheduledInterviewForInterviewee
);
router.get("/interviewer-name", verifyToken, getInterviewerName);
router.post("/interviewer-slot", verifyToken, getInterviewerBookedSlot);
router.get(
  "/pending-feedbacks-interviewee",
  verifyToken,
  pendingFeedbacksForInterviewee
);

export default router;
