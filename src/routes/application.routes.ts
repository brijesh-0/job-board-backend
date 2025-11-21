import { Router } from "express";
import { body } from "express-validator";
import {
  createApplication,
  getCandidateApplications,
  withdrawApplication,
  updateApplicationStatus,
} from "../controllers/application.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { validate } from "../middleware/validation.middleware";

const router = Router();

// Candidate routes
router.post(
  "/",
  authenticate,
  requireRole("candidate"),
  validate([
    body("jobId").notEmpty().withMessage("Job ID is required"),
    body("resumeUrl").isURL().withMessage("Valid resume URL is required"),
  ]),
  createApplication,
);

router.get(
  "/",
  authenticate,
  requireRole("candidate"),
  getCandidateApplications,
);
router.put(
  "/:id/withdraw",
  authenticate,
  requireRole("candidate"),
  withdrawApplication,
);

// Employer routes
router.put(
  "/:id/status",
  authenticate,
  requireRole("employer"),
  validate([
    body("status")
      .isIn(["Applied", "Screening", "Interview", "Offer", "Rejected"])
      .withMessage("Invalid status"),
  ]),
  updateApplicationStatus,
);

export default router;
