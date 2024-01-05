import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfully
    // console.log("File is uploaded on Cloudinary");
    // console.log(response.url);

    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed

    return null;
  }
};

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    if (!publicId) return null;

    // delete from cloudinary
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    console.log("Response: ", response);
    console.log("file delete successfully from cloudinar");

    return response;
  } catch (error) {
    console.log(error.message);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
