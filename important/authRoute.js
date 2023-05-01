const express = require("express");
const router = express.Router();
const verifyAuth = require("../middleware/authenticate");

const { logout, unlock, refreshToken, welcome, changePassword, myInfo } = require("../controllers/auth");

// router.route("/register").post(register);
// router.route("/login").post(login);
router.route("/logout").post(verifyAuth, logout);
router.route("/unlock").post(verifyAuth, unlock);
router.route("/refresh-token").post(refreshToken);
router.route("/welcome").post(verifyAuth, welcome);
router.route("/me").get(verifyAuth, myInfo);
router.route("/change-password").post(verifyAuth, changePassword);

module.exports = router;