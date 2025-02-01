import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { File, IReelPayload } from "./reel.interface";
import { JwtPayload } from "jsonwebtoken";
import Reel from "./reel.model";
import redis from "../../utils/redisClient";
import { compressVideo } from "./reel.utils";
import minioClient, { bucketName } from "../../utils/minioClient";
import Like from "../like/like.model";

const uploadReel = async (
  file: File,
  data: IReelPayload,
  authUser: JwtPayload
) => {
  const { title, description } = data;
  const timestamp = Date.now();
  const compressedVideoFileName = `videos/${timestamp}_${file.originalname}`;
  const thumbnailFileName = `thumbnails/${timestamp}_thumbnail.png`;

  try {
    const compressedBuffer = await compressVideo(file.buffer);
    await minioClient.putObject(
      bucketName,
      compressedVideoFileName,
      compressedBuffer
    );

    const videoPublicUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${compressedVideoFileName}`;
    const thumbnailUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${thumbnailFileName}`;

    const reel = new Reel({
      title,
      description,
      video_url: videoPublicUrl,
      thumbnail: thumbnailUrl,
      author: authUser.id,
    });

    await reel.save();
    return reel;
  } catch (error) {
    await minioClient.removeObject(bucketName, compressedVideoFileName);
    await minioClient.removeObject(bucketName, thumbnailFileName);

    throw new AppError(StatusCodes.BAD_REQUEST, `Error uploading`);
  }
};

const getAllReels = async (query: Record<string, unknown>) => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const cacheKey = `videos:page-${page}:limit-${limit}`;
  const cachedVideos = await redis.get(cacheKey);

  if (cachedVideos) {
    return JSON.parse(cachedVideos);
  }

  const reels = await Reel.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: "desc" })
    .populate("author");

  const meta = {
    page,
    limit,
    total: await Reel.countDocuments(),
  };

  const result = {
    meta,
    data: reels,
  };

  await redis.setex(cacheKey, 60, JSON.stringify(result));
  return result;
};

const getReelById = async (id: string, userIp: string) => {
  const cacheKey = `video:${id}`;
  const viewKey = `video_view:${id}:${userIp}`;

  const cachedVideo = await redis.get(cacheKey);
  let result;

  if (cachedVideo) {
    result = JSON.parse(cachedVideo);
  } else {
    const reel = await Reel.findById(id).populate("author");

    const prevVideoId = await Reel.findOne({ _id: { $lt: id } }).sort({
      _id: -1,
    });
    const nextVideoId = await Reel.findOne({ _id: { $gt: id } }).sort({
      _id: 1,
    });

    result = {
      prev: prevVideoId,
      next: nextVideoId,
      reel,
    };
  }

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "Video not found!");
  }

  const hasViewed = await redis.get(viewKey);
  if (!hasViewed) {
    await Reel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
    await redis.setex(viewKey, 60, "1");
  }

  if (!cachedVideo) {
    await redis.setex(cacheKey, 180, JSON.stringify(result));
  }

  return result;
};

const likeReel = async (videoId: string, authUser: JwtPayload) => {
  const reel = await Reel.findById(videoId);
  if (!reel) throw new AppError(StatusCodes.NOT_FOUND, "Video not found!");

  const likeKey = `video_like:${videoId}:${authUser.id}`;
  const cacheKey = `video:${videoId}`;

  // Check if user already liked the video
  const hasLiked = await Like.exists({ videoId: videoId, userId: authUser.id });

  try {
    if (hasLiked) {
      // Remove like
      await Like.deleteOne({ videoId, userId: authUser.id });

      // Decrement like count on video
      reel.likes -= 1;
      await reel.save();

      await redis.del(likeKey);
      await redis.setex(cacheKey, 30, JSON.stringify(reel));

      return {
        message: "Reel unliked successfully",
        videoId,
        likeCount: reel.likes,
      };
    } else {
      // Add like
      await Like.create({ videoId, userId: authUser.id });

      // Increment like count on video
      reel.likes += 1;
      await reel.save();

      await redis.setex(likeKey, 30, "1");
      await redis.setex(cacheKey, 60, JSON.stringify(reel));

      return {
        message: "Reel liked successfully",
        videoId,
        likeCount: reel.likes,
      };
    }
  } catch (error) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Error liking/unliking the video"
    );
  }
};

export const ReelService = {
  uploadReel,
  getAllReels,
  getReelById,
  likeReel,
};
