import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types";
import { errorResponse } from "../utils/response.util";

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(errorResponse("Authentication required"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      res
        .status(403)
        .json(
          errorResponse(`Access denied. Required role: ${roles.join(" or ")}`),
        );
      return;
    }

    next();
  };
};
