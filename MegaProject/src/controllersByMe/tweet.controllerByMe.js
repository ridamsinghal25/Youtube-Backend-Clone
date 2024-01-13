import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../modelsByMe/tweet.modelByMe.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  // steps to create tweet
  // take content for tweet from req.body
  // validate it
  // store user id in variable from req.user._id
  // create tweet
  // validate it
  // response

  const { content } = req.body;
  const userId = req.user._id;

  if (!content) {
    throw new ApiError(400, "content is required");
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const tweet = await Tweet.create({
    content,
    owner: userId,
  });

  if (!tweet) {
    throw new ApiError(400, "Error while creating tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // steps to get user tweets
  // take user id from req.params
  // validate it
  // check if user exists with that id
  // find user tweet by using find() method
  // validate it
  // response

  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const userTweets = await Tweet.find({ owner: userId });

  if (userTweets.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "user has not tweeted yet"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userTweets, "user tweets fetched successfully"));
});

export { createTweet, getUserTweets };
