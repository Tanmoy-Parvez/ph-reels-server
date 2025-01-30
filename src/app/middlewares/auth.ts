import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import AppError from "../errors/AppError";
import config from "../config";
import User from "../modules/user/user.model";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized!");
    }

    const decoded = jwt.verify(
      token,
      config.jwt.secret as string
    ) as JwtPayload;

    const { id } = decoded;

    const user = await User.findById(id).select("id");

    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, "This user is not found!");
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
