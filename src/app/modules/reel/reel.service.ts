import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { File, IReelPayload } from "./reel.interface";
import { JwtPayload } from "jsonwebtoken";
import Reel from "./reel.model";
import redis from "../../utils/redisClient";
import { compressVideo } from "./reel.utils";
import minioClient, { bucketName } from "../../utils/minioClient";
import Like from "../like/like.model";
import { Types } from "mongoose";

const uploadReel = async (
  file: File,
  data: IReelPayload,
  authUser: JwtPayload
) => {
  const { title, description } = data;
  const timestamp = Date.now();
  const compressedVideoFileName = `videos/${timestamp}_${file.originalname}`;

  try {
    const compressedBuffer = await compressVideo(file.buffer);
    await minioClient.putObject(
      bucketName,
      compressedVideoFileName,
      compressedBuffer
    );

    const videoPublicUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${compressedVideoFileName}`;

    const reel = new Reel({
      title,
      description,
      video_url: videoPublicUrl,
      author: authUser.id,
    });

    await reel.save();
    return reel;
  } catch (error) {
    await minioClient.removeObject(bucketName, compressedVideoFileName);

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
    .populate("author", "name email _id");

  const meta = {
    page,
    limit,
    total: await Reel.countDocuments(),
  };

  const result = {
    meta,
    reels,
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

  const hasLiked = await Like.exists({ videoId: videoId, userId: authUser.id });

  try {
    if (hasLiked) {
      await Like.deleteOne({ videoId, userId: authUser.id });

      reel.likes -= 1;
      await reel.save();

      await redis.del(likeKey);
      await redis.setex(cacheKey, 30, JSON.stringify(reel));

      return {
        message: "Reel unliked successfully",
        videoId,
        liked: false,
      };
    } else {
      await Like.create({ videoId, userId: authUser.id });

      reel.likes += 1;
      await reel.save();

      await redis.setex(likeKey, 30, "1");
      await redis.setex(cacheKey, 60, JSON.stringify(reel));

      return {
        message: "Reel liked successfully",
        videoId,
        liked: true,
      };
    }
  } catch (error) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Error liking/unliking the video"
    );
  }
};

const getReelAnalytics = async (
  authUser: JwtPayload,
  query: Record<string, unknown>
): Promise<any> => {
  const { dateRange } = query;
  const userId = authUser.id;

  const dateFilter: any = {};

  if (dateRange) {
    const now = new Date();
    switch (dateRange) {
      case "last7d":
        dateFilter.$gte = new Date(now.setDate(now.getDate() - 7));
        break;
      case "last30d":
        dateFilter.$gte = new Date(now.setDate(now.getDate() - 30));
        break;
      case "last1year":
        dateFilter.$gte = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        break;
    }
  }

  try {
    const videoStats = await Reel.aggregate([
      {
        $match: {
          author: new Types.ObjectId(userId),
          ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
        },
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
          totalUploads: { $sum: 1 },
        },
      },
    ]);

    const likeStats = await Like.countDocuments({
      userId,
      ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
    });

    return {
      totalViews: videoStats[0]?.totalViews || 0,
      totalLikes: likeStats || 0,
      totalUploads: videoStats[0]?.totalUploads || 0,
    };
  } catch (error) {
    throw new Error(`Error fetching analytics`);
  }
};

const deleteReel = async (reelId: string, authUser: JwtPayload) => {
  try {
    const reel = await Reel.findById(reelId);

    if (!reel) {
      throw new AppError(StatusCodes.NOT_FOUND, "Reel not found!");
    }

    if (reel.author.toString() !== authUser.id) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "Unauthorized to delete this reel."
      );
    }

    const videoPath = reel.video_url.split(`${bucketName}/`)[1];
    if (videoPath) {
      await minioClient.removeObject(bucketName, videoPath);
    }

    await Like.deleteMany({ videoId: reelId });

    const result = await Reel.findByIdAndDelete(reelId);

    await redis.del(`video:${reelId}`);
    await redis.del(`videos:page-1:limit-10`);

    return result;
  } catch (error) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Error deleting the reel"
    );
  }
};

export const ReelService = {
  uploadReel,
  getAllReels,
  getReelById,
  likeReel,
  getReelAnalytics,
  deleteReel,
};
