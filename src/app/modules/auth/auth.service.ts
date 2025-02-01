import { StatusCodes } from "http-status-codes";
import {
  ILogin,
  ILoginResponse,
  IRefreshTokenResponse,
  IUser,
} from "./auth.interface";
import User from "./auth.model";
import { comparePasswords, hashedPassword } from "./auth.utils";
import AppError from "../../errors/AppError";
import { jwtHelpers } from "../../utils/jwtHelpers";
import config from "../../config";
import { Secret } from "jsonwebtoken";

// register user
const registerUser = async (payload: Partial<IUser>) => {
  const existingUser = await User.findOne({ email: payload.email });

  if (existingUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Email already in use!");
  }

  payload.password = await hashedPassword(payload.password as string);
  payload.passwordConfirm = await hashedPassword(
    payload.passwordConfirm as string
  );

  const user = await User.create(payload);

  const accessToken = jwtHelpers.createToken(
    { id: user._id, email: user.email },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.createToken(
    { id: user._id, email: user.email },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    name: user.name,
    email: user.email,
    accessToken,
    refreshToken,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

// login user
const loginUser = async (payload: ILogin): Promise<ILoginResponse> => {
  const { email, password } = payload;

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid credentials!");
  }

  const isPasswordValid = await comparePasswords(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Wrong Password!");
  }

  const accessToken = jwtHelpers.createToken(
    { id: user._id, email: user.email },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.createToken(
    { id: user._id, email: user.email },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

// refresh token
const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  let verifiedToken;

  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret
    );
  } catch (err) {
    throw new AppError(StatusCodes.FORBIDDEN, "Invalid Refresh Token");
  }

  const { id } = verifiedToken;

  const user = await User.findById(id).select("id email");

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User does not exist");
  }

  const newAccessToken = jwtHelpers.createToken(
    { id: user._id, email: user.email },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  return { accessToken: newAccessToken };
};

export const AuthServices = {
  registerUser,
  loginUser,
  refreshToken,
};
