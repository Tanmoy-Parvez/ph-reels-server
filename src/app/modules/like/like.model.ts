import { Schema, model, Document, Types } from "mongoose";

interface ILike extends Document {
  videoId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const likeSchema = new Schema<ILike>(
  {
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "Reel",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Like = model<ILike>("Like", likeSchema);

export default Like;
