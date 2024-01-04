import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.Middleware.js";
import {
  deleteVideo,
  uploadVideo,
} from "../controllersByMe/video.controllerByMe.js";

const router = Router();

router.route("/upload-video").post(
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

router.route("/delete-video/:_id").delete(verifyJWT, deleteVideo);

export default router;
