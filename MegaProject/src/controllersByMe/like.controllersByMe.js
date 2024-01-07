import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Like } from "../modelsByMe/like.modelsByMe.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  // Steps to like video
  // take videoId as req.params
  // find video using videoId
  // validate it (means if video exists)
  // Now, find in likes database if there is already like exists on that specific video with that user
  // if exists then remove it
  // if not then create a new like document with videoId and user
  // then response

  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(404, "videoId is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  const likeExists = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (!likeExists) {
    const likingVideo = await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });

    if (!likingVideo) {
      throw new ApiError(400, "Error while liking a video");
    }
    console.log(likingVideo);
    return res
      .status(200)
      .json(new ApiResponse(200, likingVideo, "video liked successfully"));
  } else {
    await likeExists.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "video liked remove successfully"));
  }
});

export { toggleVideoLike };
