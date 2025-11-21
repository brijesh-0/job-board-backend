import { ApiResponse } from "../types";

export const successResponse = <T>(data: T, meta?: any): ApiResponse<T> => {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
};

export const errorResponse = (message: string): ApiResponse => {
  return {
    success: false,
    error: message,
  };
};

export const calculatePagination = (
  page: number = 1,
  limit: number = 20,
  total: number,
) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
