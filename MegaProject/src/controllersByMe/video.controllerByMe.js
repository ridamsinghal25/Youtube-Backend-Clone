import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.Model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// Upload Video
// Delete Video
// Update Video
// Get Video Details
// Update Video Thumbnail

const uploadVideo = asyncHandler(async (req, res) => {
  // steps to upload video
  // take video details
  // validate them - not empty
  // take video file
  // validate it - not empty
  // uplooad to cloudinary
  // verify if uploaded on cloudinary properly
  // create video
  // check if video is created

  const { title, description } = req.body;

  if ([title, description].some((field) => field === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const videoLocalPath = req.files?.video[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(404, "video file is required");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(404, "thumbnail file is required");
  }

  const videoFile = await uploadOnCloudinary(videoLocalPath);

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile || !thumbnail) {
    throw new ApiError(400, "Error while uploading on cloudinary");
  }
  // console.log("videoFile: ", videoFile);
  // console.log("thumbnail: ", thumbnail);

  // want to see how to create owner
  let owner = req.user?._id;

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: {
      public_id: thumbnail.public_id,
      url: thumbnail.url,
    },
    title,
    description,
    duration: videoFile.duration,
    // owner: owner,
  });

  if (!video) {
    throw new ApiError(400, "Error while creating video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video uploaded successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {});

export { uploadVideo, deleteVideo };
