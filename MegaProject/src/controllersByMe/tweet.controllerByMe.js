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
  const { page = 1, limit = 1 } = req.query;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const options = {
    page,
    limit,
  };

  const tweets = Tweet.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
  ]);

  const userTweets = await Tweet.aggregatePaginate(tweets, options);

  if (userTweets.totalDocs === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "user has not tweeted yet"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userTweets, "user tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  // steps to update tweet
  // take tweet id from req.params
  // take content to update
  // validate them
  // use findByIdAndUpdate() method
  // validate it
  // response

  const { tweetId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "content is required");
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  const newTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  if (!newTweet) {
    throw new ApiError(404, "tweet not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newTweet, "user tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  // steps to delete tweet
  // take tweet id from req.params
  // validate it
  // use findByIdAndDelete() method
  // validate it
  // response

  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  const tweet = await Tweet.findByIdAndDelete(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
