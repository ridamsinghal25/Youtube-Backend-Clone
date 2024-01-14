import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  // Steps to get channel stats
  // take userId as only user owner has access to this board
  // now, using user id find out
  //  1. totalVideoAndViews
  //  2. subscribersCount

  const userId = req.user._id;

  const totalVideoAndViews = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: "$owner",
        totalViews: {
          $sum: "$views",
        },
        totalVideos: {
          $sum: 1,
        },
      },
    },
  ]);

  const subscribersCount = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: "$channel",
        totalSubscribers: {
          $sum: 1,
        },
      },
    },
  ]);

  const channelStats = {
    totalVideoAndViews,
    subscribersCount,
  };

  if (totalVideoAndViews.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "No content on this channel"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelStats, "channel stats fetched successfully")
    );
});

const getChannelVideo = asyncHandler(async (req, res) => {
  // steps to get channel video
  // store userId in the variable
  // use $match operator in Video model to match all user video
  // use $project operator to get only selected information
  // response

  const userId = req.user._id;

  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);

  if (videos.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "user has not uploaded any video"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideo };
