import { Schema, model } from "mongoose";
import { IUser } from "./auth.interface";

const AuthSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    passwordConfirm: { type: String, required: true },
  },
  { timestamps: true }
);

const User = model<IUser>("User", AuthSchema);
export default User;
