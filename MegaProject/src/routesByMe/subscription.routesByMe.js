import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleSubscription } from "../controllersByMe/subscription.controllersByMe.js";

const router = Router();

router.use(verifyJWT);

router.route("/c/:channelId").post(toggleSubscription);

export default router;
