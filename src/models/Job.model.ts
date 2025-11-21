import mongoose, { Schema, Types } from "mongoose";
import { IJob } from "../types";

const jobSchema = new Schema<IJob>(
  {
    employerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    company: {
      name: {
        type: String,
        required: [true, "Company name is required"],
      },
      logoUrl: String,
    },
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    isRemote: {
      type: Boolean,
      default: false,
    },
    salary: {
      min: {
        type: Number,
        required: [true, "Minimum salary is required"],
      },
      max: {
        type: Number,
        required: [true, "Maximum salary is required"],
      },
      currency: {
        type: String,
        default: "INR",
      },
    },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship"],
      required: [true, "Employment type is required"],
    },
    tags: [String],
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  {
    timestamps: true,
  },
);

export const Job = mongoose.model<IJob>("Job", jobSchema);
