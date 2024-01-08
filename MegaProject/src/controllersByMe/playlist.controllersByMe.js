import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../modelsByMe/playlist.modelsByMe.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createPlaylist = asyncHandler(async (req, res) => {
  // Steps to create a playlist
  // take content and description from the req.body
  // take videoId (bcz youtube let you create playlist on video so one video will be in a playlist)
  // validate videoId and other fields
  // create playlist using create() method
  // validate it
  // response

  const { name, description } = req.body;
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!name || !description) {
    throw new ApiError(400, "All fields are required");
  }

  if (!isValidObjectId(videoId) || !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid id");
  }

  const playlist = await Playlist.create({
    name,
    description,
    videos: [videoId],
    owner: userId,
  });

  if (!playlist) {
    throw new ApiError(400, "Error while creating playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));
});

export { createPlaylist };
