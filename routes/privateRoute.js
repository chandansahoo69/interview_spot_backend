import express from "express";
import { scheduleInterview, updateProfile } from "../controllers/auth.js";

const router = express.Router();

router.post("/updateProfile", updateProfile);
router.post("/scheduleInterview", scheduleInterview);

export default router;
