import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Like } from "../modelsByMe/like.modelsByMe.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../modelsByMe/comment.modelsByMe.js";
import { Tweet } from "../modelsByMe/tweet.modelByMe.js";

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

  if (!isValidObjectId(videoId)) {
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

const toggleCommentLike = asyncHandler(async (req, res) => {
  // steps to toggle comment like
  // take comment id from req.params
  // validate it if exists or not
  // check if like exists or not on that comment
  // if exists unlike the comment and if not like it
  // return response

  const { commentId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  const commentExists = await Comment.findById(commentId);

  if (!commentExists) {
    throw new ApiError(404, "comment not found");
  }

  const likeExistsOnComment = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  if (!likeExistsOnComment) {
    const likingComment = await Like.create({
      comment: commentId,
      likedBy: userId,
    });

    if (!likingComment) {
      throw new ApiError(400, "Error while liking comment");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, likingComment, "comment liked successfully"));
  } else {
    const unlikeComment = await likeExistsOnComment.deleteOne();

    if (!unlikeComment) {
      throw new ApiError(400, "Error while unliking comment");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "comment unliked successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  // steps to toggle tweet like
  // take tweet id from req.params
  // validate it if exists or not
  // check if like exists or not on that tweet
  // if exists unlike the tweet and if not like it
  // return response

  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  const tweetExists = await Tweet.findById(tweetId);

  if (!tweetExists) {
    throw new ApiError(404, "tweet not found");
  }

  const likeExistsOnTweet = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });

  if (!likeExistsOnTweet) {
    const likingTweet = await Like.create({
      tweet: tweetId,
      likedBy: userId,
    });

    if (!likingTweet) {
      throw new ApiError(400, "Error while liking a tweet");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, likingTweet, "tweet liked successfully"));
  } else {
    const unlikeTweet = await likeExistsOnTweet.deleteOne();

    if (!unlikeTweet) {
      throw new ApiError(400, "Error while unliking tweet");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "tweet unliked successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  // steps to get liked videos
  //

  const likedVideoIds = await Like.distinct("video");

  const likedVideos = await Video.aggregate([
    {
      $match: {
        _id: {
          $in: likedVideoIds.map(
            (videoId) => new mongoose.Types.ObjectId(videoId)
          ),
        },
      },
    },
  ]);
  console.log("likedVideos: ", likedVideos);
  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "liked videos fetched successfully")
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
