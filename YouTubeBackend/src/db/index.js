import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );
    console.log(
      `\nMongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB connection FAILED ", error);
    process.exit(1);
  }
};

// Contributed by me

const connectDB2 = async () => {
  await mongoose
    .connect(`${process.env.MONGO_URI}`)
    .then((connectionInstance) => {
      console.log(
        `\n MongoDB connected TWO !! DB HOST: ${connectionInstance.connection.host}`
      );
    })
    .catch((err) => {
      console.log("MongoDB connection FAILED: ", err);
    });
};

export default connectDB;
