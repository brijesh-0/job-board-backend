import { Router } from "express";
import { body } from "express-validator";
import { getUploadSignature } from "../controllers/upload.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";

const router = Router();

router.post(
  "/signature",
  authenticate,
  validate([
    body("filename").notEmpty().withMessage("Filename is required"),
    body("mimeType")
      .equals("application/pdf")
      .withMessage("Only PDF files are allowed"),
    body("size")
      .isInt({ max: 5 * 1024 * 1024 })
      .withMessage("File size must not exceed 5MB"),
  ]),
  getUploadSignature,
);

export default router;
