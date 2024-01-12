import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  deleteVideo,
  getAllVideo,
  getVideoById,
  togglePublishStatus,
  updateVideoDetails,
  updateVideoThumbnail,
  uploadVideo,
} from "../controllersByMe/video.controllerByMe.js";

const router = Router();

router.route("/upload-video/").post(
  verifyJWT,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  uploadVideo
);

router.route("/delete-video/:videoId").delete(verifyJWT, deleteVideo);

router.route("/update-video/:videoId").patch(verifyJWT, updateVideoDetails);

router.route("/publish-status/:videoId").patch(verifyJWT, togglePublishStatus);

router.route("/video-details/:videoId").get(verifyJWT, getVideoById);

router
  .route("/update-video-thumbnail/:videoId")
  .patch(verifyJWT, upload.single("thumbnail"), updateVideoThumbnail);

router.route("/").get(verifyJWT, getAllVideo);

export default router;
