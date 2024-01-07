import { Video } from "../models/video.model.js";
import { Comment } from "../modelsByMe/comment.modelsByMe.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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

  if (!videoId || !content) {
    throw new ApiError(400, "All fields are required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "video not found");
  }
  console.log("content: ", content);

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  if (!comment) {
    throw new ApiError(400, "Error while uploading comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment created successfully"));
});

export { addComment };

// add comment to videos using
// video.comments.push(newComment._id);
// await video.save();
