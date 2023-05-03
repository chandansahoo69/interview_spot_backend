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
import moment from "moment";

import mongoose from "mongoose";
import Interviewer from "../models/interviewerSchema.js";
import Interviewee from "../models/intervieweeSchema.js";
import Interview from "../models/interviewSchema.js";

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
  try {
    const { username, email, password, confirm_password, role } = req.body;
    if (!(username && email && password && role && confirm_password)) {
      return res.status(422).json({
        error: "Username/email/Password/role are mandatory",
      });
    }

    if (password !== confirm_password) {
      return res.status(422).json({
        error: "Password is not matching.",
      });
    }

    const userEmailExists = await User.findOne({ email: email });

    if (userEmailExists) {
      return res
        .status(422)
        .json({ error: "A User with this email already exists." });
    }

    // if (!schema.validate(password)) {
    //   return res.status(422).json({
    //     error:
    //       "Password must contain at least 8 characters, 2 digits, 1 symbol, 1 uppercase and 1 lowercase letter.",
    //   });
    // }

    try {
      const user = new User({
        username,
        email,
        password,
        role,
      });
      await user.save();
      console.log("user", user);
      // based on role create a schema for user.
      if (role === "interviewer") {
        const interviewer = new Interviewer({
          userId: user._id,
        });
        await interviewer.save();
      } else {
        const interviewee = new Interviewee({
          userId: user._id,
        });
        await interviewee.save();
      }
    } catch (error) {
      console.log("register: ", error);
    }

    res.status(200).json({
      success: true,
      message: "User Registered Successfully.",
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
      const passMatch = await user.matchPassword(password);
      if (!passMatch) {
        return res.status(400).json({ error: "Invalid Credentials!" });
      }

      //access and refresh tokens
      const accessToken = user.getSignedAccessToken();
      const refreshToken = user.getSignedRefreshToken();

      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      user.loginAttempt = 0;
      await user.save();

      let roleUser;
      let userId = user._id;
      if (user.role === "interviewer") {
        roleUser = await Interviewer.findOne({ userId }).select(
          "phone gender avatar linkedIn department bookedSlot"
        );
      } else {
        roleUser = await Interviewee.findOne({ userId }).select(
          "phone gender dob address avatar skills education experience projects socials"
        );
      }

      console.log("findeing role user", roleUser);

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
          phone: roleUser.phone,
          gender: roleUser.gender,
          avatar: roleUser.avatar,
        },
      });
    } else return res.status(400).json({ error: "User don't exists" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
    console.log(err.message);
  }
}

export async function updateProfile(req, res) {
  //   let userID = req.user._id;
  const {
    phone,
    gender,
    avatar,
    dob,
    address,
    skills,
    education,
    experience,
    projects,
    linkedIn,
    department,
  } = req.body;

  let userID = "64511b9c162d3b0bada83d79";
  console.log("frontend", linkedIn);

  const user = await User.findOne({ _id: userID });
  console.log("update profile", user);

  if (user.role === "interviewer") {
    let roleUser = await Interviewer.findOne({ userId: userID });
    roleUser.phone = phone;
    roleUser.gender = gender;
    roleUser.avatar = avatar;
    roleUser.linkedIn = linkedIn;
    roleUser.department = department;

    roleUser.save();
  } else {
    let roleUser = await Interviewee.findOne({ userId: userID });
    if (!roleUser) {
      return res.status(400).json({ error: "User Not Found!" });
    }
    roleUser.phone = phone;
    roleUser.gender = gender;
    roleUser.dob = dob;
    roleUser.avatar = avatar;
    roleUser.address = address;
    roleUser.skills = skills;
    roleUser.education = education;
    roleUser.experience = experience;
    roleUser.projects = projects;

    roleUser.save();
  }

  res.status(200).json({
    success: true,
    message: "User Updated Successfully.",
  });
}

export async function scheduleInterview(req, res) {
  const {
    interviewerId,
    intervieweeId,
    category,
    date,
    interviewee,
    interviewer,
    timeSlot,
  } = req.body;

  if (
    !(
      interviewerId &&
      intervieweeId &&
      category &&
      interviewee &&
      interviewer &&
      timeSlot
    )
  ) {
    return res.status(422).json({
      error:
        "interviewerId, intervieweeId, category, date, interviewee, interviewer, timeSlot are mandatory",
    });
  }

  let previousDate = new Date();
  previousDate.setDate(previousDate.getDate() - 1);

  if (moment(new Date(date)).isBefore(previousDate)) {
    return res.status(403).json({
      success: true,
      error: "Interview can't be schedule on previous date.",
    });
  }

  try {
    const interviewerInfo = await Interviewer.findOne({
      userId: interviewerId,
    });
    if (!interviewerInfo) {
      return res.status(400).json({
        success: false,
        error: "Interviewer not found",
      });
    }

    const intervieweeInfo = await Interviewee.findOne({
      userId: intervieweeId,
    });
    if (!intervieweeInfo) {
      return res.status(400).json({
        success: false,
        error: "Interviewee not found",
      });
    }

    const slotObj = {
      date: date,
      timeSlot: [timeSlot],
    };

    let isBookedSlotDateNotFound = false;
    let isTimeSlotFound = false;
    interviewerInfo.bookedSlot?.map((element) => {
      if (
        new Date(date).toLocaleDateString() ===
        new Date(element?.date).toLocaleDateString()
      ) {
        isBookedSlotDateNotFound = true;
        isTimeSlotFound = false;
        element?.timeSlot.map((slot) => {
          if (slot === timeSlot) {
            isTimeSlotFound = true;
          }
        });
        if (isTimeSlotFound === false) {
          element.timeSlot.push(timeSlot);
        }
      }
    });

    if (isBookedSlotDateNotFound && isTimeSlotFound) {
      return res.status(403).json({
        success: true,
        error: "Timeslot already booked.",
      });
    }

    if (!isBookedSlotDateNotFound) {
      interviewerInfo.bookedSlot.push(slotObj);
    }

    // save interview time slot info on interviewer table
    interviewerInfo.save();

    // create interview schema
    try {
      const interview = new Interview({
        interviewerId,
        intervieweeId,
        category,
        date,
        interviewee,
        interviewer,
        timeSlot,
        status: "Pending",
      });
      await interview.save();
      console.log("interview", interview);
    } catch (error) {
      console.log("interview: ", error);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: true,
      error: "Server error",
    });
  }

  res.status(200).json({
    success: true,
    message: "Interview Scheduled.",
  });
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
    const user = await User.findOne({ _id: userID }).select(
      "username email role"
    );
    //   .populate({ path: "designation", select: "designation" })
    //   .populate({ path: "reportingPerson", select: "username" })

    let roleUser;
    let userInfo;
    let userId = user._id;
    if (user.role === "interviewer") {
      roleUser = await Interviewer.findOne({ userId }).select(
        "phone gender avatar linkedIn department bookedSlot"
      );
      userInfo = {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: roleUser.phone,
        gender: roleUser.gender,
        avatar: roleUser.avatar,
        linkedIn: roleUser.linkedIn,
        department: roleUser.department,
        bookedSlot: roleUser.bookedSlot,
      };
    } else {
      roleUser = await Interviewee.findOne({ userId }).select(
        "phone gender dob address avatar skills education experience projects socials"
      );
      userInfo = {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: roleUser.phone,
        gender: roleUser.gender,
        avatar: roleUser.avatar,
        skills: roleUser.skills,
        education: roleUser.education,
        experience: roleUser.experience,
        projects: roleUser.projects,
        socials: roleUser.socials,
      };
    }

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
