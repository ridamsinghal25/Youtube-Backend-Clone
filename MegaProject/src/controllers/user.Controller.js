import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.Model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // if (accessToken && refreshToken) console.log("token are coming");

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error while generating access and refresh token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  /* Steps for user Register */
  //  Data collection from user
  //  Validation - not empty
  //  check if user already exists: username , email
  //  check for images, check for avatar
  //  upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return response

  const { fullName, email, username, password } = req.body;
  console.log("email: ", email);

  // if (fullName === "") {
  //   throw new ApiError(400, "fullName is required")
  // }

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is reqired");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log(avatar);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is reqired");
  }

  const user = await User.create({
    fullName,
    avatar: {
      public_id: avatar.public_id,
      url: avatar.url,
    },
    coverImage: {
      public_id: coverImage.public_id,
      url: coverImage.url || "",
    },
    email,
    password,
    username: username.toLowerCase(),
  });

  // const user = await User.create({
  //   fullName,
  //   avatar:{
  //   publicId: avatar.publicId,
  //   url: avatar.url
  //   }
  //   coverImage:{
  //   publicId: coverImage.publicId,
  //   url:  coverImage.url
  //   }
  //   email,
  //   password,
  //   username: username.toLowerCase(),
  // });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // steps to do login
  // data collection - user
  // data is valid username or email
  // user exists or not
  // password check
  // generate jwt token
  // send cookie

  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(401, "username and email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user does not exists");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  // console.log("access: l ", accessToken);
  // console.log("refresh: l ", refreshToken);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User login successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // Steps to logout user
  // collect user id from middleware
  // clear the cookie
  // set refreshToken to undefined

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logout successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // steps to refresh access token
  // collect refresh token from the cookies
  // validate it -
  // decode with jwt
  // conditional check incomingRefreshToken with refreshToken saved in database
  // generate the new token
  // response

  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedToken._id); // ? optional chaining

  if (!user) {
    throw new ApiError(404, "Invalid refresh token");
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh token is expired or used");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  const { accessToken, newRefreshToken } = generateAccessTokenAndRefreshToken(
    user._id
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: newRefreshToken },
        "Access Token refreshed"
      )
    );
});

const changeUserPassword = asyncHandler(async (req, res) => {
  /*
    // Only login user can change password
    // verify user from the verifyJWT middleware
  */

  // steps to change user password
  // take user old and new password
  // validate not empty
  // find user so that you can check it exists
  // validate user
  // check old password with the password saved in database
  // set new password as the user password
  // save user password
  // response

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword && !newPassword) {
    throw new ApiError(400, "All fields are required");
  }

  // since we verify user using jwt middleware
  // it return us a req.user = user
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(400, "user does not exists");
  }

  const isPasswordCorrect = user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUserDetails = asyncHandler(async (req, res) => {
  // we only want that only login user can there details so
  // we will run verifyJWT middleware before routing it so
  // from there we will get the user object

  return res
    .status(200)
    .json(new ApiResponse(200, user, "user fetched successfully"));
});

const updateUserAccountDetails = asyncHandler(async (req, res) => {
  // steps to update user details
  // collet information to be updated
  // validate - not empty
  // user find (get user details from verifyJWT middleware)
  // and update
  // remove password and any other things
  // response

  const { fullName, email } = req.body;

  if (!fullName || !email) {
    // agar fullName nahi hai toh execute hona or agar email nahi hai toh execute hona
    throw new ApiError(400, "All fields are required");
  }

  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "user account updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  // steps to update use avatar
  // take user avatar file
  // validate it
  // upload to cloudinary
  // validate cloudinary url
  // find user and update its avatar
  // response

  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  //TODO: delete old image - assignment

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading file on cloudinary");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Avatar file updated successfully")
    );
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  // steps to update use CoverImage
  // take user CoverImage file
  // validate it
  // upload to cloudinary
  // validate cloudinary url
  // find user and update its CoverImage
  // response

  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading file on cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "coverImage file updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(404, "username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username,
      },
    },
    {
      $lookup: {
        from: "Subscription",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "Subscription",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        subscribedByMe: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: ["req.user?._id", "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        email: 1,
        subscribersCount: 1,
        subscribedByMe: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        username: 1,
      },
    },
  ]);
  console.log("Channel's Info. :", channel);

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "user profile fetched successfully")
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeUserPassword,
  getCurrentUserDetails,
  updateUserAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
};
