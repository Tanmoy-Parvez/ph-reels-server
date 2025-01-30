import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { UserValidation } from "./user.validation";
import { UserController } from "./user.controller";

const router = express.Router();

router.post(
  "/register",
  validateRequest(UserValidation.registerValidationSchema),
  UserController.registerUser
);

router.post(
  "/login",
  validateRequest(UserValidation.loginValidationSchema),
  UserController.loginUser
);

export const authRoutes = router;
