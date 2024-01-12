import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";

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
    owner: req.user._id,
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

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
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

  if (!deletemsg) {
    throw new ApiError(400, "Error while deleting video");
  }

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

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
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

const getVideoById = asyncHandler(async (req, res) => {
  // Steps to get video details
  // take videoId of the video
  // validate it
  // find video using findById() method
  // validate it
  // use mongodb aggregation pipeline
  // response

  const videoId = req.params.videoId;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  video.views = video.views + 1;

  await video.save();

  let videoDetails = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "owner",
        foreignField: "channel",
        as: "subscriberCount",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
        subscriberCount: {
          $size: "$subscriberCount",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user._id, "$subscriberCount.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
  ]);

  if (!videoDetails) {
    throw new ApiError(404, "video not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, videoDetails, "video details fetched successfully")
    );
});

const updateVideoThumbnail = asyncHandler(async (req, res) => {
  // Steps to update video thumbnail
  // take video it from req.params
  // validate it
  // take file from system
  // upload to cloudinary
  // find user using id
  // take old thumbnail public_id for deleting
  // update user
  // delete old thumbnail from cloudinary
  // response

  const videoId = req.params.videoId;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const thumbnailLocalPath = req.file?.path;

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail file is required");
  }

  const uploadThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!uploadThumbnail.url || !uploadThumbnail.public_id) {
    throw new ApiError(400, "Error while uploading on cloudinary");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  const oldThumbnailPublicId = video.thumbnail?.public_id;

  if (!oldThumbnailPublicId) {
    throw new ApiError(404, "thumbnail public_id not found");
  }

  const updatedVideo = await Video.updateOne(
    { _id: videoId },
    {
      $set: {
        thumbnail: {
          public_id: uploadThumbnail.public_id,
          url: uploadThumbnail.url,
        },
      },
    }
  );

  if (!updatedVideo) {
    throw new ApiError(400, "Error while updating file");
  }

  const deleteThumbnail = await deleteFromCloudinary(oldThumbnailPublicId);

  if (!deleteThumbnail) {
    throw new ApiError(400, "Error while deleting file from cloudinary");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedVideo, "video thumbnail updated successfully")
    );
});

const getAllVideo = asyncHandler(async (req, res) => {
  // Steps to get all video
  // take all required information from req.query
  // Now, validate all fields to check they are not empty
  /* sortBy -> tells by which field to sort (eg. title, description, etc)
   * sortType -> tells two options ascending(asc) or descending(desc)
   */
  // Now, use mongodb aggregation pipeline
  // 1. $match using $and operator both the query and userId
  // 2. sort order taken from the req.query
  // 3. use mongodb aggregate paginate

  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (!query || !sortBy || !sortType) {
    throw new ApiError(404, "All fields are required");
  }

  const userExists = await User.findById(userId);

  if (!userExists) {
    throw new ApiError(404, "user not found");
  }

  console.log(typeof parseInt(page));

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };
  console.log(" fhdfh", typeof options.page);
  // create sortOptions
  let sortOptions = {};

  /* Here, if sortBy exists  then it set sortOptions property to sortBy using [] bracket notation
   *  and its value is set using ternary operation that says if sortType === desc then
   *  set sortOptions[sortBy] to -1 else 1
   *
   * You can also write the below condition like this
   *
   *    let sortOptions = {
   *        [sortBy]: sortType === 'desc' ? -1 : 1
   *    }
   */
  if (sortBy) {
    sortOptions[sortBy] = sortType === "desc" ? -1 : 1;
  }

  const videoAggregationPipeline = Video.aggregate([
    {
      $match: {
        $and: [
          {
            owner: new mongoose.Types.ObjectId(userId),
          },
          {
            title: {
              $regex: query,
              $options: "i",
            },
          },
        ],
      },
    },
    {
      $sort: sortOptions,
    },
  ]);

  const resultedVideo = await Video.aggregatePaginate(
    videoAggregationPipeline,
    options
  );

  if (resultedVideo.totalDocs === 0) {
    return res.status(200).json(new ApiResponse(200, {}, "user has no video"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, resultedVideo, "video fetched successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  // steps to toggle publish status
  // take video id from req.params
  // validate it and find if exists
  // store video.isPublished into variable and apply if condition on it
  // if not exists unpublish it
  // else publish it
  // response

  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  let videoPublishStatus = video.isPublished;

  if (!videoPublishStatus) {
    video.isPublished = true;
  } else {
    video.isPublished = false;
  }

  const updatedVideo = await video.save();

  if (!updatedVideo) {
    throw new ApiError(400, "error while updating video");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedVideo,
        "video publish status updated successfully"
      )
    );
});

export {
  uploadVideo,
  deleteVideo,
  updateVideoDetails,
  getVideoById,
  updateVideoThumbnail,
  getAllVideo,
  togglePublishStatus,
};
