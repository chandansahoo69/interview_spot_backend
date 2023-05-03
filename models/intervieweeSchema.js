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
      enum: ["male", "female"],
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
        cgpa: Number,
        startDate: Date,
        endDate: Date,
      },
    ],
    experience: [
      {
        name: String,
        description: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    projects: [
      {
        name: String,
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
