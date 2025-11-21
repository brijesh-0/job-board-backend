import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../config/jwt";
import { User } from "../models/User.model";
import { errorResponse } from "../utils/response.util";
import { getTokenFromCookie } from "../utils/cookie.util";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Try to get token from cookie first, then fallback to Authorization header
    let token = getTokenFromCookie(req.cookies);

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      res.status(401).json(errorResponse("No token provided"));
      return;
    }

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json(errorResponse("User not found"));
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
