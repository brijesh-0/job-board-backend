import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { errorResponse } from "../utils/response.util";

export const validate = (validations: ValidationChain[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    for (const validation of validations) {
      await validation.run(req);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      res.status(400).json(errorResponse(errorMessages.join(", ")));
      return;
    }

    next();
  };
};
