import { NextFunction, Request, Response } from "express";
import config from "../../config";
import sendResponse from "../../utils/sendResponse";
import { ILoginResponse } from "./user.interface";
import { UserServices } from "./user.service";

//register user
const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await UserServices.registerUser(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

//login user
const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await UserServices.loginUser(req.body);

    sendResponse<ILoginResponse>(res, {
      statusCode: 200,
      success: true,
      message: "User logged in successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const UserController = {
  registerUser,
  loginUser,
};
