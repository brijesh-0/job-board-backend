import { Request, Response, NextFunction } from "express";
import { Job } from "../models/Job.model";
import { Application } from "../models/Application.model";
import {
  successResponse,
  errorResponse,
  calculatePagination,
} from "../utils/response.util";
import { isValidSalaryRange } from "../utils/validation.util";
import { JobSearchQuery } from "../types";

export const createJob = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      title,
      description,
      location,
      isRemote,
      salary,
      employmentType,
      tags,
    } = req.body;

    if (!isValidSalaryRange(salary.min, salary.max)) {
      res.status(400).json(errorResponse("Invalid salary range"));
      return;
    }

    // Use company from user profile
    const user = req.user!;
    if (!user.company) {
      res
        .status(400)
        .json(
          errorResponse(
            "Company information not found in profile. Please update your profile.",
          ),
        );
      return;
    }

    const job = await Job.create({
      employerId: user._id,
      title,
      description,
      location,
      isRemote,
      salary: {
        ...salary,
        currency: "INR", // Force INR
      },
      employmentType,
      tags,
      company: {
        name: user.company,
        logoUrl: req.body.companyLogoUrl, // Optional logo URL
      },
    });

    res.status(201).json(successResponse(job));
  } catch (error) {
    next(error);
  }
};

export const getJob = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404).json(errorResponse("Job not found"));
      return;
    }

    // Count applicants
    const applicantCount = await Application.countDocuments({ jobId: job._id });

    res.json(successResponse({ ...job.toObject(), applicantCount }));
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404).json(errorResponse("Job not found"));
      return;
    }

    if (job.employerId.toString() !== req.user!._id.toString()) {
      res.status(403).json(errorResponse("Not authorized"));
      return;
    }

    const updates = req.body;

    // Validate salary if provided
    if (
      updates.salary &&
      !isValidSalaryRange(updates.salary.min, updates.salary.max)
    ) {
      res.status(400).json(errorResponse("Invalid salary range"));
      return;
    }

    // Force INR currency if salary is updated
    if (updates.salary) {
      updates.salary.currency = "INR";
    }

    // Don't allow company name changes (it comes from user profile)
    // But allow logo URL updates
    if (updates.companyLogoUrl) {
      updates.company = {
        name: req.user!.company!,
        logoUrl: updates.companyLogoUrl,
      };
      delete updates.companyLogoUrl;
    }

    // Remove company from updates if somehow passed
    if (updates.company?.name) {
      delete updates.company.name;
    }

    Object.assign(job, updates);
    await job.save();

    res.json(successResponse(job));
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404).json(errorResponse("Job not found"));
      return;
    }

    if (job.employerId.toString() !== req.user!._id.toString()) {
      res.status(403).json(errorResponse("Not authorized"));
      return;
    }

    // Soft delete by closing the job
    job.status = "closed";
    await job.save();

    res.json(successResponse({ message: "Job closed successfully" }));
  } catch (error) {
    next(error);
  }
};

export const getEmployerJobs = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const query: any = { employerId: req.user!._id };
    if (req.query.status) {
      query.status = req.query.status;
    }

    const [jobs, total] = await Promise.all([
      Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Job.countDocuments(query),
    ]);

    // Get applicant counts for each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({
          jobId: job._id,
        });
        return { ...job.toObject(), applicantCount };
      }),
    );

    res.json(
      successResponse(jobsWithCounts, calculatePagination(page, limit, total)),
    );
  } catch (error) {
    next(error);
  }
};

export const searchJobs = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = req.query as JobSearchQuery;
    const page = parseInt(query.page as any) || 1;
    const limit = parseInt(query.limit as any) || 20;
    const skip = (page - 1) * limit;

    const filter: any = { status: "open" };

    // Text search
    if (query.q) {
      filter.$text = { $search: query.q };
    }

    // Location filter
    if (query.location) {
      filter.location = new RegExp(query.location, "i");
    }

    // Remote filter
    if (query.isRemote !== undefined) {
      filter.isRemote = query.isRemote === "true";
    }

    // Salary filter
    if (query.salaryMin) {
      filter["salary.max"] = { $gte: parseInt(query.salaryMin as any) };
    }

    // Employment type filter
    if (query.employmentType) {
      filter.employmentType = query.employmentType;
    }

    const sortOptions: any =
      query.sort === "relevance" && query.q
        ? { score: { $meta: "textScore" } }
        : { createdAt: -1 };

    const [jobs, total] = await Promise.all([
      Job.find(filter).sort(sortOptions).skip(skip).limit(limit),
      Job.countDocuments(filter),
    ]);

    res.json(successResponse(jobs, calculatePagination(page, limit, total)));
  } catch (error) {
    next(error);
  }
};

export const getJobApplications = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404).json(errorResponse("Job not found"));
      return;
    }

    if (job.employerId.toString() !== req.user!._id.toString()) {
      res.status(403).json(errorResponse("Not authorized"));
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: any = { jobId: job._id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate("candidateId", "name email profile resumeUrl")
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
