import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../modelsByMe/playlist.modelsByMe.js";
import { Video } from "../models/video.model.js";
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

const getUserPlaylists = asyncHandler(async (req, res) => {
  // Steps to get all user playlists
  // take userId from req.params
  // validate userId
  // find user in playlist database to get all playlist created by user
  // validate it
  // response

  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const userPlaylists = await Playlist.find({ owner: userId });

  if (!userPlaylists || userPlaylists?.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "user has no playlist"));
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

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  // Steps to add video to playlist
  // take video and playlist id
  // validate both of them
  // from video database find video by id
  // then verify if video exists
  // use findByIdAndUpdate() method to add video
  // validate it
  // response

  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        videos: [videoId],
      },
    },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist updated successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  // Steps to remove video from playlist
  // take video and playlist id from req.params
  // validate them
  // Now find playlist using findById() method
  // Now, in that playlist find video if exists
  // Use array splice() method to remove video from playlist
  // validate it
  // response

  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid id");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }

  const videoIndex = playlist.videos.indexOf(videoId);

  if (videoIndex === -1) {
    throw new ApiError(404, "video not found");
  }

  const updatedPlaylist = playlist.videos.splice(videoIndex, 1);

  if (!updatedPlaylist) {
    throw new ApiError(400, "Error while removing video from playlist");
  }

  await playlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "video deleted successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  // Steps to delete a playlist
  // take a playlist id from req.params
  // validate it
  // use findByIdAndDelete() method
  // response

  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid id");
  }

  const playlist = await Playlist.findByIdAndDelete(playlistId);

  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  // steps to update a playlist
  // take a playlist id from req.params
  // take content and description from req.body
  // validate them
  // find playlist using id
  // update it with findByIdAndUpdate() method
  // response

  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(400, "All fields are required");
  }

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
