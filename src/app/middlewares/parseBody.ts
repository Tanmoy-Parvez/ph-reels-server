import { StatusCodes } from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import AppError from "../errors/AppError";

export const parseBody = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.data) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Please provide data in the body under data key"
      );
    }
    req.body = JSON.parse(req.body.data);
    next();
  } catch (error) {
    next(error);
  }
};
