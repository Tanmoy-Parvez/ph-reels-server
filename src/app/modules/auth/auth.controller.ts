import { NextFunction, Request, Response } from "express";
import { AuthServices } from "./auth.service";
import config from "../../config";
import sendResponse from "../../utils/sendResponse";
import { ILoginResponse, IRefreshTokenResponse } from "./auth.interface";

// register user
const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await AuthServices.registerUser(req.body);
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
    const result = await AuthServices.loginUser(req.body);
    const { refreshToken, accessToken } = result;

    const cookieOptions = {
      secure: config.NODE_ENV === "production",
      httpOnly: true,
    };

    res.cookie("refreshToken", refreshToken, cookieOptions);

    sendResponse<ILoginResponse>(res, {
      statusCode: 200,
      success: true,
      message: "User logged in successfully!",
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

// refresh access token

const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Refresh token is required",
      });
    }

    const result = await AuthServices.refreshToken(refreshToken);

    sendResponse<IRefreshTokenResponse>(res, {
      statusCode: 200,
      success: true,
      message: "Access token generated!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const AuthController = {
  registerUser,
  loginUser,
  refreshToken,
};
