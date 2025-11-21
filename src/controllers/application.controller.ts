import { Request, Response, NextFunction } from "express";
import { Application } from "../models/Application.model";
import { Job } from "../models/Job.model";
import { User } from "../models/User.model";
import {
  successResponse,
  errorResponse,
  calculatePagination,
} from "../utils/response.util";
import { isValidStatusTransition } from "../utils/validation.util";
import {
  sendApplicationReceivedEmail,
  sendStatusUpdateEmail,
} from "../utils/email.util";

export const createApplication = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { jobId, coverLetter, resumeUrl } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json(errorResponse("Job not found"));
      return;
    }

    if (job.status === "closed") {
      res.status(400).json(errorResponse("Job is closed"));
      return;
    }

    // Check for duplicate application
    const existingApplication = await Application.findOne({
      jobId,
      candidateId: req.user!._id,
    });

    if (existingApplication) {
      res
        .status(409)
        .json(errorResponse("You have already applied to this job"));
      return;
    }

    const application = await Application.create({
      jobId,
      candidateId: req.user!._id,
      employerId: job.employerId,
      coverLetter,
      resumeUrl,
      status: "Applied",
      statusHistory: [
        {
          status: "Applied",
          changedBy: req.user!._id,
          changedAt: new Date(),
        },
      ],
    });

    // Send email notification to employer
    const employer = await User.findById(job.employerId);
    if (employer) {
      await sendApplicationReceivedEmail(
        employer,
        req.user!.name,
        job.title,
        resumeUrl,
      );
    }

    res.status(201).json(successResponse(application));
  } catch (error) {
    next(error);
  }
};

export const getCandidateApplications = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const filter: any = { candidateId: req.user!._id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate("jobId", "title company location salary employmentType")
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limit),
      Application.countDocuments(filter),
    ]);

    res.json(
      successResponse(applications, calculatePagination(page, limit, total)),
    );
  } catch (error) {
    next(error);
  }
};

export const withdrawApplication = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      res.status(404).json(errorResponse("Application not found"));
      return;
    }

    if (application.candidateId.toString() !== req.user!._id.toString()) {
      res.status(403).json(errorResponse("Not authorized"));
      return;
    }

    application.isWithdrawn = true;
    application.withdrawnAt = new Date();
    await application.save();

    res.json(successResponse(application));
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { status, note } = req.body;

    const application = await Application.findById(req.params.id).populate(
      "jobId",
    );

    if (!application) {
      res.status(404).json(errorResponse("Application not found"));
      return;
    }

    if (application.employerId.toString() !== req.user!._id.toString()) {
      res.status(403).json(errorResponse("Not authorized"));
      return;
    }

    // Validate status transition
    if (!isValidStatusTransition(application.status, status)) {
      res
        .status(400)
        .json(
          errorResponse(
            `Invalid status transition from ${application.status} to ${status}`,
          ),
        );
      return;
    }

    application.status = status;
    application.statusHistory.push({
      status,
      changedBy: req.user!._id,
      changedAt: new Date(),
      note,
    });

    await application.save();

    // Send email notification to candidate
    const candidate = await User.findById(application.candidateId);
    const job = application.jobId as any;
    if (candidate && job) {
      await sendStatusUpdateEmail(candidate, job.title, status);
    }

    res.json(successResponse(application));
  } catch (error) {
    next(error);
  }
};
