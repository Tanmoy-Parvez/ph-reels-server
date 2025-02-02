import express from "express";
import { ReelController } from "./reel.controller";
import upload from "../../middlewares/upload";
import { parseBody } from "../../middlewares/parseBody";
import { auth } from "../../middlewares/auth";

const router = express.Router();

router.get("/", ReelController.getAllReels);
router.get("/analytics", auth, ReelController.getReelAnalytics);
router.get("/:id", ReelController.getReelById);

router.post(
  "/upload",
  auth,
  upload.single("video"),
  parseBody,
  ReelController.uploadReel
);

router.post("/like/:id", auth, ReelController.likeReel);
router.delete("/:id", auth, ReelController.deleteReelById);

export const reelRoutes = router;
