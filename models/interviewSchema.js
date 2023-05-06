import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const InterviewSchema = new mongoose.Schema(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    interviewerId: { type: Schema.Types.ObjectId, ref: "Interviewer" },
    intervieweeId: { type: Schema.Types.ObjectId, ref: "Interviewee" },
    interviewer: {
      type: String,
    },
    interviewee: {
      type: String,
    },
    date: { type: Date },
    category: {
      type: String,
      enum: ["Behavioral", "Technical", "Specialized"],
    },
    timeSlot: {
      type: String,
      enum: [
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
      ],
    },
    status: {
      type: String,
      enum: ["Pending", "Rejected", "Accepted", "Completed"],
    },
    rejectReason: { type: String },
    feedback: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.model("Interview", InterviewSchema);
