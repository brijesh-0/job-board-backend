import mongoose, { Schema, Types } from "mongoose";
import { IApplication } from "../types";

const statusHistorySchema = new Schema({
  status: {
    type: String,
    required: true,
  },
  changedBy: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
  note: String,
});

const applicationSchema = new Schema<IApplication>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Job",
      index: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    employerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    coverLetter: String,
    resumeUrl: {
      type: String,
      required: [true, "Resume URL is required"],
    },
    status: {
      type: String,
      enum: ["Applied", "Screening", "Interview", "Offer", "Rejected"],
      default: "Applied",
    },
    statusHistory: [statusHistorySchema],
    isWithdrawn: {
      type: Boolean,
      default: false,
    },
    withdrawnAt: Date,
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

export const Application = mongoose.model<IApplication>(
  "Application",
  applicationSchema,
);
