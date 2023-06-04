import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const IntervieweeSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    phone: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    dob: {
      type: Date,
    },
    address: {
      type: String,
    },
    avatar: { type: String },
    skills: { type: [String] },
    education: [
      {
        name: String,
        course: String,
        cgpa: Number,
        startDate: Date,
        endDate: Date,
      },
    ],
    experience: [
      {
        position: String,
        name: String,
        description: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    projects: [
      {
        name: String,
        technology: String,
        description: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    socials: { type: [String] },
  },
  { timestamps: true }
);

export default mongoose.model("Interviewee", IntervieweeSchema);
