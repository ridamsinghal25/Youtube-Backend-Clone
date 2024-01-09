import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes imports

import userRouter from "./routes/user.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter);

// route imports by me
import videoRouterByMe from "./routesByMe/video.routesByMe.js";
import likeRouterByMe from "./routesByMe/like.routesByMe.js";
import commentRouterByMe from "./routesByMe/comment.routesByMe.js";
import playlistRouterByMe from "./routesByMe/playlist.routesByMe.js";
import subscriptionRoutesByMe from "./routesByMe/subscription.routesByMe.js";

// routes declaration defined by me
app.use("/api/v1/videos-by-me", videoRouterByMe);
app.use("/api/v1/likes-by-me", likeRouterByMe);
app.use("/api/v1/comment-by-me", commentRouterByMe);
app.use("/api/v1/playlist-by-me", playlistRouterByMe);
app.use("/api/v1/subscription-by-me", subscriptionRoutesByMe);

export { app };
