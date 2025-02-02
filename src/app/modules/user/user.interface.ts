export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ILogin = {
  email: string;
  password: string;
};

export type ILoginResponse = {
  accessToken: string;
  refreshToken?: string;
};
