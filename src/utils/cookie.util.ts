import { Response } from "express";

const COOKIE_NAME = process.env.COOKIE_NAME || "job_board_token";
const COOKIE_MAX_AGE = parseInt(process.env.COOKIE_MAX_AGE || "604800000"); // 7 days in ms
const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? "strict" : "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
};

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? "strict" : "lax",
    path: "/",
  });
};

export const getTokenFromCookie = (cookies: any): string | undefined => {
  return cookies[COOKIE_NAME];
};
