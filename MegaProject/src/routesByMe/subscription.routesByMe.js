import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getUserChannelSubscriber,
  toggleSubscription,
} from "../controllersByMe/subscription.controllersByMe.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/c/:channelId")
  .post(toggleSubscription)
  .get(getUserChannelSubscriber);

export default router;
