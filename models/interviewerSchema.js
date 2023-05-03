import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const InterviewerSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    phone: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    avatar: { type: String },
    linkedIn: { type: String },
    department: { type: String },
    bookedSlot: [
      {
        date: Date,
        timeSlot: [String],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Interviewer", InterviewerSchema);
