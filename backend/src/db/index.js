import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import logger from "../../logger.js";

const connectDB = async () => {
  try {
    
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`,
      {
        serverApi: {
          version: "1",
          strict: true,
          deprecationErrors: true,
        },
      }
    );
    
    logger.info(
      `\n MongoDB connected ! DB host:${connectionInstance.connection.host}`
    );
  } catch (error) {
 logger.error(`MongoDB connection error ${error}`);
 process.exit(1);
  }
};

export default connectDB;