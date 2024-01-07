import { Video } from "../models/video.model.js";
import { Comment } from "../modelsByMe/comment.modelsByMe.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";

const addComment = asyncHandler(async (req, res) => {
  // Steps to add comment
  // take comment content from req.body
  // take videoId on which to comment from req.params
  // find video using videoId
  // validate video (means if exists)
  // No need to find comment like you find likes bcz you can have multiple comment
  // create comment
  // validate it
  // response

  const { videoId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!videoId || !content) {
    throw new ApiError(400, "All fields are required");
  }

  if (!isValidObjectId(videoId) || !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid object id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: userId,
  });

  if (!comment) {
    throw new ApiError(400, "Error while uploading comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment created successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // Steps to update comment
  // take comment id from req.params
  // take updated content from req.body
  // validate comment id using isValidObjectId
  // use findByIdAndUpdate() method to update comment
  // response

  const { commentId } = req.params;
  const { content } = req.body;

  if (!commentId || !content) {
    throw new ApiError(400, "All fields are required");
  }

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  if (!updatedComment) {
    throw new ApiError(404, "Error while updating comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "comment updated successfully"));
});

export { addComment, updateComment };

// add comment to videos using
// video.comments.push(newComment._id);
// await video.save();
