import { Router } from "express";
import { body } from "express-validator";
import {
  createJob,
  getJob,
  updateJob,
  deleteJob,
  getEmployerJobs,
  searchJobs,
  getJobApplications,
} from "../controllers/job.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { validate } from "../middleware/validation.middleware";

const router = Router();

// Public routes
router.get("/", searchJobs);
router.get("/:id", getJob);

// Employer routes - FIXED ORDER (more specific routes first)
router.get(
  "/employer/jobs",
  authenticate,
  requireRole("employer"),
  getEmployerJobs,
);
router.get(
  "/:id/applications",
  authenticate,
  requireRole("employer"),
  getJobApplications,
);

router.post(
  "/",
  authenticate,
  requireRole("employer"),
  validate([
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
    body("location").trim().notEmpty().withMessage("Location is required"),
    body("salary.min")
      .isNumeric()
      .withMessage("Minimum salary must be a number"),
    body("salary.max")
      .isNumeric()
      .withMessage("Maximum salary must be a number"),
    body("employmentType")
      .isIn(["full-time", "part-time", "contract", "internship"])
      .withMessage("Invalid employment type"),
    // Company name is now taken from user profile, not required in request
    body("companyLogoUrl")
      .optional()
      .isURL()
      .withMessage("Company logo must be a valid URL"),
  ]),
  createJob,
);

router.put("/:id", authenticate, requireRole("employer"), updateJob);
router.delete("/:id", authenticate, requireRole("employer"), deleteJob);

export default router;
