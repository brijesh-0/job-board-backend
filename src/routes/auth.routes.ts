import { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  getCurrentUser,
  logout,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";

const router = Router();

router.post(
  "/register",
  validate([
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn(["candidate", "employer"])
      .withMessage("Role must be candidate or employer"),
    body("company")
      .if(body("role").equals("employer"))
      .trim()
      .notEmpty()
      .withMessage("Company name is required for employers"),
  ]),
  register,
);

router.post(
  "/login",
  validate([
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ]),
  login,
);

router.get("/me", authenticate, getCurrentUser);

router.post("/logout", authenticate, logout);

export default router;
