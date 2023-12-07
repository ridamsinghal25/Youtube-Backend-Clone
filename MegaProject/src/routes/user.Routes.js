import { Router } from "express";
import { registerUser } from "../controllers/user.Controller.js";
import { upload } from "../middlewares/multer.Middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

export default router;
