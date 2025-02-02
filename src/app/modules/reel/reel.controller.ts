import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import AppError from "../../errors/AppError";
import { ReelService } from "./reel.service";

const uploadReel = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      throw new AppError(400, "File is required!");
    }

    console.log("user: ", req.user);

    const result = await ReelService.uploadReel(file, req.body, req.user);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Reel uploaded successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      sendResponse(res, {
        statusCode: error.statusCode,
        success: false,
        message: error.message,
      });
    } else {
      sendResponse(res, {
        statusCode: 500,
        success: false,
        message: "An error occurred while uploading the video.",
      });
    }
  }
};

const getAllReels = async (req: Request, res: Response) => {
  try {
    const result = await ReelService.getAllReels(req.query);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Reels retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "An error occurred while retrieving videos.",
    });
  }
};

const getReelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ip = req.ip;

    const result = await ReelService.getReelById(id, ip as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Reel retrieved successfully",
      data: result,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "An error occurred while retrieving the video.",
    });
  }
};

const likeReel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await ReelService.likeReel(id, req.user);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "An error occurred while liking the video.",
    });
  }
};

const getReelAnalytics = async (req: Request, res: Response) => {
  try {
    const result = await ReelService.getReelAnalytics(req.user, req.query);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Analytics retrieved successfully",
      data: result,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: `Error retrieving analytics`,
    });
  }
};

const deleteReelById = async (req: Request, res: Response) => {
  try {
    await ReelService.deleteReel(req.params.id, req.user);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Reel Deleted successfully",
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "An error occurred while deleting the reel.",
    });
  }
};

export const ReelController = {
  uploadReel,
  getAllReels,
  getReelById,
  likeReel,
  getReelAnalytics,
  deleteReelById,
};
