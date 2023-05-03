import express from "express";
import {
  intervieweeProfile,
  interviewerProfile,
  scheduleInterview,
  updateProfile,
} from "../controllers/auth.js";
import verifyToken from "../middleware/authenticate.js";

const router = express.Router();

router.post("/updateProfile", updateProfile);
router.get("/interviewer/:id", verifyToken, interviewerProfile);
router.get("/interviewee/:id", verifyToken, intervieweeProfile);
router.post("/scheduleInterview", scheduleInterview);

export default router;
