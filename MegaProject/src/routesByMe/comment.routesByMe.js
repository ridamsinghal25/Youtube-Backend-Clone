import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment } from "../controllersByMe/comment.controllerByMe.js";

const router = Router();
router.use(verifyJWT);

router.route("/:videoId").post(addComment);

export default router;
