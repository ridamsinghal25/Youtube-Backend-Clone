import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
} from "../controllersByMe/playlist.controllersByMe.js";

const router = Router();

router.use(verifyJWT);

router.route("/:videoId").post(createPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

router.route("/:playlistId").get(getPlaylistById);

router.route("/add/:playlistId/:videoId").patch(addVideoToPlaylist);
router.route("/remove/:playlistId/:videoId").patch(removeVideoFromPlaylist);

export default router;
