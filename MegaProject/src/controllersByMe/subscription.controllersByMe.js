import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export { toggleSubscription };
