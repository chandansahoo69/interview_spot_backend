import express from "express";
import { logout, myInfo, refreshToken } from "../controllers/auth.js";
import verifyToken from "../middleware/authenticate.js";

const router = express.Router();

router.post("/me", verifyToken, myInfo);
router.post("/logout", verifyToken, logout);
router.post("/refresh-token", refreshToken);

export default router;
