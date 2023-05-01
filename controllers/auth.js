// const { default: mongoose, Mongoose } = require("mongoose");
// require("dotenv").config();
// const User = require("../models/userSchema");
// const Notification = require("../models/notificationSchema");
// const jwt = require("jsonwebtoken");
// const passwordValidator = require('password-validator');
// const Designation = require("../models/designationSchema");

import passwordValidator from "password-validator";
import jwt from "jsonwebtoken";
import User from "../models/userSchema.js";

import mongoose from "mongoose";

/* password validator schema */
let schema = new passwordValidator();
schema
  .is()
  .min(8)
  .is()
  .max(30)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits(2)
  .has()
  .symbols(1)
  .has()
  .not()
  .spaces()
  .is()
  .not()
  .oneOf(["Passw0rd", "Password123"]);

//register controller --- Only Available to HR
export async function register(req, res) {
  //   const admin = req.user;
  //   if (admin.role !== "HR") {
  //     return res.status(403).json({
  //       message:
  //         "Only HRs are allowed to access this route and register employees",
  //     });
  //   }
  try {
    const { username, email, password, role } = req.body;
    if (!(username && email && password && role)) {
      return res.status(422).json({
        error: "Username/email/Password/role are mandatory",
      });
    }

    // console.log(schema.validate(password))

    const userEmailExists = await User.findOne({ email: email });
    // const userPhoneExists = await User.findOne({ phoneNumber: phoneNumber });
    // const employeeExists = await User.findOne({ employeeID: employeeID });

    if (userEmailExists) {
      return res
        .status(422)
        .json({ error: "A User with this email already exists." });
    }

    // if (userPhoneExists) {
    //   return res
    //     .status(422)
    //     .json({ error: "A User with this phone already exists." });
    // }
    // if (employeeExists) {
    //   return res
    //     .status(422)
    //     .json({ error: "A User with this Employee ID already exists." });
    // }

    // if (!schema.validate(password)) {
    //   return res.status(422).json({
    //     error:
    //       "Password must contain at least 8 characters, 2 digits, 1 symbol, 1 uppercase and 1 lowercase letter.",
    //   });
    // }

    //check if valid designation and reporting person provided
    // const designatioExists = await Designation.findOne({ _id: designation });
    // if (!designatioExists)
    //   return res.status(403).json({ message: "Designation does not exists" });

    // designatioExists.canBeDeleted == true
    //   ? (designatioExists.canBeDeleted = false)
    //   : null;
    // await designatioExists.save();

    // const reportingPersonExists = await User.findOne({ _id: reportingPerson });
    // if (!reportingPersonExists)
    //   return res
    //     .status(403)
    //     .json({ message: "Reporting Person does not exists" });

    try {
      const user = new User({
        username,
        email,
        password,
        role,
      });
      await user.save();
    } catch (error) {
      console.log("register: ", error);
    }

    // ........ Send Notification to Admins ........

    // const admins = await User.find({ role: "HR" });
    // const adminIds = Mongoose.Types.ObjectId(admins.map((admin) => admin._id));
    // const adminIds = admins.map((admin) => admin._id);

    // const adminIds = admins.map((admin) => ({ userID: admin._id }));
    // console.log(adminIds);
    // const userID = { userID: admin._id };
    // const notification = new Notification({
    //   // to: user._id,
    //   to: userID,
    //   from: admin._id,
    //   message: `Hello ${user.username}, Welcome to the company.`,
    // });
    // await notification.save();

    // .......................

    res.status(200).json({
      success: true,
      message: "User Registered Successfully.",
      notification: "Notification Sent to the User",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error occurred while registering. Please try again later.",
    });
    console.log(error.message);
  }
}

//login controller
export async function login(req, res) {
  const { email, password } = req.body;
  console.log("login", email, password);
  if (!email || !password) {
    return res.status(400).json({ error: "Empty Credentials!" });
  }
  try {
    const user = await User.findOne({ email });
    console.log("user", user);
    if (user) {
      //user locking functionality
      if (!user.isLocked) {
        if (user.loginAttempt >= 3) {
          user.isLocked = true;
          await user.save();
          return res.status(403).json({
            error:
              "The user has been locked out due to multiple login failure. " +
              "Please contact Admin to unlock.",
          });
        }
        const passMatch = await user.matchPassword(password);
        // if (!passMatch) {
        //   user.loginAttempt += 1;
        //   await user.save();
        //   return res.status(400).json({ error: "Invalid Credentials!" });
        // }
        //access and refresh tokens
        const accessToken = user.getSignedAccessToken();
        const refreshToken = user.getSignedRefreshToken();

        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        user.loginAttempt = 0;
        await user.save();

        res.status(200).json({
          success: true,
          accessToken,
          refreshToken,
          message: "Login Success",
          user: {
            userId: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avtar: user.avtar,
          },
        });
      } else
        return res
          .status(400)
          .json({ error: "The user is locked. Please unlock." });
    } else return res.status(400).json({ error: "User don't exists" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
    console.log(err.message);
  }
}

//refresh token router
export async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(404).json({ message: "Invalid refresh token " });
  }

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
  const findUser = await User.findById(decoded.id);

  if (!findUser) return res.status(404).json({ message: "User not found" });
  if (findUser.refreshToken !== refreshToken) {
    return res.status(404).json({ message: "The refresh token is invalid" });
  } else {
    const accessToken = findUser.getSignedAccessToken();
    findUser.accessToken = accessToken;
    await findUser.save();
    return res.status(201).json({ success: true, accessToken });
  }
}

//middleware testing controller
export async function welcome(req, res) {
  // console.log(req.user);
  res.status(200).send("Welcome 🙌 ");
}

export async function checking(req, res) {
  // console.log(req.user);
  res.status(200).send("checking 🙌 ");
}

//myinfo
export async function myInfo(req, res) {
  try {
    let userID = req.user._id;
    // console.log("user", req.user);
    const userInfo = await User.findOne({ _id: userID }).select(
      "username employeeID designation dateOfJoining dateOfBirth email phoneNumber personalEmail role reportingPerson avtar"
    );
    //   .populate({ path: "designation", select: "designation" })
    //   .populate({ path: "reportingPerson", select: "username" })
    return res.status(200).json(userInfo);
  } catch (error) {
    console.log("me error: ", error);
    return res
      .status(500)
      .json({ message: "Unable to get your Info. Server Error" });
  }
}

//logout router
export async function logout(req, res) {
  const user = req.user;
  // console.log(user);
  try {
    user.accessToken = "";
    user.refreshToken = "";
    await user.save();
    res.status(200).json({ message: "Logged Out Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
}

export async function changePassword(req, res) {
  const userId = req.user.id;
  const { password, newPassword, confirmNewPassword } = req.body;
  if (newPassword !== confirmNewPassword)
    return res
      .status(400)
      .json({ message: "New Password and Confirm Password must be same" });

  if (!schema.validate(newPassword)) {
    return res.status(422).json({
      error:
        "Password must contain at least 8 characters, 2 digits, 1 symbol, 1 uppercase and 1 lowercase letter.",
    });
  }

  try {
    const user = await User.findOne({ _id: userId });
    const passMatch = await user.matchPassword(password);
    if (!passMatch) {
      return res.status(403).send({
        message: "Inccorent Password. Please enter your current password",
      });
    }
    user.password = newPassword;
    await user.save();
    return res.status(200).send({
      success: true,
      message: "Your password was changed successfully",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Unable to change password. Server Error" });
  }
}

//Only available to admins
export async function resetPassword(req, res) {
  const admin = req.user;
  if (admin.role !== "Admin" && admin.role !== "HR") {
    return res.status(403).json({
      message:
        "Only Admins are allowed to access this route and reset password",
    });
  }
  const { userId, employeeID } = req.body;

  try {
    const user = await User.findOne({ _id: userId, employeeID: employeeID });
    if (!user)
      return res.status(404).json({ message: "User with this IDs not found" });
    user.password = process.env.RESET_PASSWORD_PHRASE;
    await user.save();
    return res
      .status(200)
      .send({ success: true, message: "Password has been reset" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Unable to change password. Server Error" });
  }
}
