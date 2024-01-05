import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
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
  // let owner = req.user?._id;

  const video = await Video.create({
    videoFile: {
      public_id: videoFile.public_id,
      url: videoFile.url,
    },
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

const deleteVideo = asyncHandler(async (req, res) => {
  // steps to delete video
  // take video id from params
  // validate it
  // find video on basis of videoId
  // delete video from cloudinary
  // delete video from database manually
  // response

  const videoId = req.params.videoId;

  if (!videoId) {
    throw new ApiError(400, "video id is required");
  }

  const deletedVideo = await Video.findById(videoId);

  if (!deletedVideo) {
    throw new ApiError(400, "video not found");
  }

  const videoFilePublicId = deletedVideo.videoFile.public_id;
  const thumbnailPublicId = deletedVideo.thumbnail.public_id;

  if (!videoFilePublicId || !thumbnailPublicId) {
    throw new ApiError(400, "video or thumbnail public id not found");
  }

  const removeVideoFromCloudinary = await deleteFromCloudinary(
    videoFilePublicId,
    "video"
  );
  const removethumbnailFromCloudinary =
    await deleteFromCloudinary(thumbnailPublicId);

  if (!removeVideoFromCloudinary || !removethumbnailFromCloudinary) {
    throw new ApiError(400, "Error while deleting file from cloudinary");
  }

  const deletemsg = await deletedVideo.deleteOne();

  console.log("deleted: ", deletemsg);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "video deleted successfully"));
});

const updateVideoDetails = asyncHandler(async (req, res) => {
  // Steps to update video details
  // take video id from req.params
  // validate it - not empty
  // take video title and description from req.body
  // validate - not empty
  // call findByIdAndUpdate() method
  // validate it
  // response

  const videoId = req.params.videoId;
  const { title, description } = req.body;

  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }

  if (!title || !description) {
    throw new ApiError(400, "All fields are required");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
      },
    },
    { new: true }
  );

  if (!video) {
    throw new ApiError(400, "Error while updating video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video updated successfully"));
});

const getVideoDetails = asyncHandler(async (req, res) => {
  // Steps to get video details
  // take videoId of the video
  // validate it
  // find video using findById() method
  // validate it
  // response

  const videoId = req.params.videoId;

  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video details fetched successfully"));
});

export { uploadVideo, deleteVideo, updateVideoDetails, getVideoDetails };
