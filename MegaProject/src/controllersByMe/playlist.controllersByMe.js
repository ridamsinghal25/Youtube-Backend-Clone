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

  if (!videoId) {
    throw new ApiError(400, "video id is required");
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

const getUserPlaylists = asyncHandler(async (req, res) => {
  // Steps to get all user playlists
  // take userId from req.params
  // validate userId
  // find user in playlist database to get all playlist created by user
  // validate it
  // response

  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "user id is required");
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const userPlaylists = await Playlist.find({ owner: userId });

  if (!userPlaylists) {
    throw new ApiError(400, "playlists not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, userPlaylists, "user playlists fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  // Steps to get playlist by id
  // take playlist id from req.params
  // validate it
  // use findById() method to find playlist
  // validate it
  // response

  const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, "playlist id is required");
  }

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

export { createPlaylist, getUserPlaylists, getPlaylistById };
