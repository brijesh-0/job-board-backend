import { Request, Response, NextFunction } from "express";
import { generateUploadSignature } from "../config/cloudinary";
import { successResponse, errorResponse } from "../utils/response.util";

export const getUploadSignature = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { filename, mimeType, size } = req.body;

    if (!filename || !mimeType || !size) {
      res.status(400).json(errorResponse("Missing required fields"));
      return;
    }

    const uploadData = generateUploadSignature(filename, mimeType, size);

    res.json(successResponse(uploadData));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};
