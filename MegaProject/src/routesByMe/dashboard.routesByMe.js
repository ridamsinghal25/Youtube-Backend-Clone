import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelStats } from "../controllersByMe/dashboard.controllerByMe.js";

const router = Router();
router.use(verifyJWT);

router.route("/stats").get(getChannelStats);

export default router;
