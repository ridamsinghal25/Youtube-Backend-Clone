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

import userRouter from "./routes/user.Routes.js";
import videoRouter from "./routes/video.routesByMe.js";

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos-by-me", videoRouter);

export { app };
