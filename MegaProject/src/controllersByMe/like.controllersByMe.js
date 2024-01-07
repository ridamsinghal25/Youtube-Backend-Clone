import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Like } from "../modelsByMe/like.modelsByMe.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";

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
  const userId = req.user._id;

  if (!videoId) {
    throw new ApiError(404, "videoId is required");
  }

  if (!isValidObjectId(videoId) || !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid object id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  const likeExists = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });

  if (!likeExists) {
    const likingVideo = await Like.create({
      video: videoId,
      likedBy: userId,
    });

    if (!likingVideo) {
      throw new ApiError(400, "Error while liking a video");
    }
    console.log(likingVideo);
    return res
      .status(200)
      .json(new ApiResponse(200, likingVideo, "video liked successfully"));
  } else {
    const deleteLike = await likeExists.deleteOne();

    if (!deleteLike) {
      throw new ApiError(404, "Error while deleting like");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "video liked remove successfully"));
  }
});

export { toggleVideoLike };

// const handleLikes = asyncHandler(async (req, res) => {
//   const { videoId } = req.params;

//   try {
//       // Aggregate pipeline to fetch all likes for the specified video and populate 'likedBy' field
//       const likes = await Like.aggregate([
//           {
//               $match: { video: mongoose.Types.ObjectId(videoId) }
//           },
//           {
//               $lookup: {
//                   from: 'users', // Assuming your User model is stored in a collection named 'users'
//                   localField: 'likedBy',
//                   foreignField: '_id',
//                   as: 'likedByDetails'
//               }
//           },
//           {
//               $unwind: '$likedByDetails'
//           },
//           {
//               $project: {
//                   _id: 1,
//                   video: 1,
//                   likedBy: '$likedByDetails._id',
//                   username: '$likedByDetails.username',
//                   createdAt: 1
//               }
//           }
//       ]);

//       return res.json({ success: true, likes });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ success: false, message: 'Internal Server Error' });
//   }
// });
