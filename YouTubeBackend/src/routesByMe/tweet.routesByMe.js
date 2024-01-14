import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllersByMe/tweet.controllerByMe.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(createTweet);

router.route("/user/:userId").get(getUserTweets);

router.route("/tweet/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;
