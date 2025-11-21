import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.model";
import { generateToken } from "../config/jwt";
import { successResponse, errorResponse } from "../utils/response.util";
import { setAuthCookie, clearAuthCookie } from "../utils/cookie.util";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password, role, company } = req.body;

    if (role === "employer" && !company) {
      res
        .status(400)
        .json(errorResponse("Company name is required for employers"));
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json(errorResponse("Email already exists"));
      return;
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role,
      company: role === "employer" ? company : undefined,
    });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    setAuthCookie(res, token);

    res.status(201).json(
      successResponse({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
        },
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      res.status(401).json(errorResponse("Invalid credentials"));
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json(errorResponse("Invalid credentials"));
      return;
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Set token in HttpOnly cookie
    setAuthCookie(res, token);

    res.json(
      successResponse({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
        },
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse("User not found"));
      return;
    }
    res.json(successResponse({ user: req.user }));
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    clearAuthCookie(res);
    res.json(successResponse({ message: "Logged out successfully" }));
  } catch (error) {
    next(error);
  }
};
