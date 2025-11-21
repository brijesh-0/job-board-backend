import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/response.util";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error("Error:", err);

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    res.status(409).json(errorResponse(`${field} already exists`));
    return;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    res.status(400).json(errorResponse(messages.join(", ")));
    return;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json(errorResponse("Invalid token"));
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json(errorResponse("Token expired"));
    return;
  }

  // Default error
  res
    .status(err.statusCode || 500)
    .json(errorResponse(err.message || "Internal server error"));
};
