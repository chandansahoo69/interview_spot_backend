const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("../models/designationSchema");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide username"],
    },
    employeeID: {
      type: String,
      required: [true, "Please provide the employeeID"],
    },
    email: {
      type: String,
      required: [true, "Please provide email address"],
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
    },
    phoneNumber: {
      type: Number,
      required: [false, "Please provide a phone number"],
      minlength: 10,
      maxlength: 10,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Please provide the DOB"],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 8,
    },
    role: {
      type: String,
      enum: ["Admin", "HR", "Employee", "Vendor", "Manager"],
      required: true,
    },
    avtar: {
      type: String,
    },
    personalEmail: {
      type: String,
      required: [false, "Please provide personal email address"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
    },
    dateOfJoining: {
      type: Date,
      required: [true, "Please provide the DOJ"],
    },
    designation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
      required: [true, "Please provide a designation"],
    },
    reportingPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide the name of reporting person"],
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    loginAttempt: {
      type: Number,
      default: 0,
    },
    accessToken: { type: String },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.getSignedAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_EXPIRE,
  });
};
UserSchema.methods.getSignedRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_EXPIRE,
  });
};

module.exports = mongoose.model("User", UserSchema);
