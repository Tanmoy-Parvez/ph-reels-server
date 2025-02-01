import { Document, Types } from "mongoose";

export interface IReel extends Document {
  title: string;
  description?: string;
  video_url: string;
  thumbnail?: string;
  views: number;
  likes: number;
  author: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface File {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
}

export interface IReelPayload {
  title: string;
  description: string;
}
