import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  // Steps to toggle subscription
  // take channel id from the req.params
  // and take user id from req.user._id
  // validate it
  // Now, make call to subscription database to find if document with provided userId and channelId exists
  // if YES, unsubscribe it means delete it
  // if NO, subscribe it means create a new document
  // response

  const { channelId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid id");
  }

  const channelExists = await User.findById(channelId);

  if (!channelExists) {
    throw new ApiError(404, "channel not found");
  }

  const subscription = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  if (!subscription) {
    const createSubscription = await Subscription.create({
      subscriber: userId,
      channel: channelId,
    });

    if (!createSubscription) {
      throw new ApiError(404, "Error while subscribing");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          createSubscription,
          "channel subscribed successfully"
        )
      );
  } else {
    const deleteSubscription = await Subscription.deleteOne({
      subscriber: userId,
      channel: channelId,
    });

    if (!deleteSubscription) {
      throw new ApiError(404, "Error while unsubscribing");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "channel unsubscribed successfully"));
  }
});

const getUserChannelSubscriber = asyncHandler(async (req, res) => {
  // Steps to get user channel subscriber
  // take channel id from req.params
  // validate it
  // verify if user with that id exists
  // Now, in database in channel field find all documents with the channelId
  // use aggregation pipeline
  // response

  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  const channelExists = await User.findById(channelId);

  if (!channelExists) {
    throw new ApiError(404, "channel not found");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberInfo",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscriberInfo: {
          $first: "$subscriberInfo",
        },
      },
    },
  ]);

  if (subscribers.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "channel has no subscriber"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers,
        "channel subscribers fetched successfully"
      )
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  // steps to get subscribed channel
  // take subscriber id
  // verify if user with that id exists
  // collect all document in subscriber field
  // as subscription is a document that contains all the document
  // Now, it depends on our specific use case to find the subscribers or channels subscribed by us
  // use mongodb aggregation pipeline
  // response

  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber id");
  }

  const userExists = await User.findById(subscriberId);

  if (!userExists) {
    throw new ApiError(404, "user not found");
  }

  const channels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelInfo",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        channelInfo: {
          $first: "$channelInfo",
        },
      },
    },
  ]);

  if (channels.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "user has not subscribed to any channel"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channels,
        "channels subscribed by user fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscriber, getSubscribedChannels };
