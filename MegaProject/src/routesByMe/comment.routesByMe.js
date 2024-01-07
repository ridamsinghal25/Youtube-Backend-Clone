import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  updateComment,
} from "../controllersByMe/comment.controllerByMe.js";

const router = Router();
router.use(verifyJWT);

router.route("/:videoId").post(addComment);

router.route("/c/:commentId").patch(updateComment);

export default router;
