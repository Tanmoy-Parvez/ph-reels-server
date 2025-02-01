import { Schema, model } from "mongoose";
import { IReel } from "./reel.interface";

const ReelSchema = new Schema<IReel>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    video_url: { type: String, required: true },
    thumbnail: { type: String, default: "" },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Reel = model<IReel>("Reel", ReelSchema);
export default Reel;
