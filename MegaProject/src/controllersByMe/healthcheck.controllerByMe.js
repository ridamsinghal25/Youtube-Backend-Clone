import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  // simply respond 200 ok system is working fine

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "System is working fine"));
});

export { healthcheck };
