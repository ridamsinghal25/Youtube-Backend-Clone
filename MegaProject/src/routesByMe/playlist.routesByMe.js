import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createPlaylist } from "../controllersByMe/playlist.controllersByMe.js";

const router = Router();

router.use(verifyJWT);

router.route("/:videoId").post(createPlaylist);

export default router;
