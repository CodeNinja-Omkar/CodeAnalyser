import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import logger from "../logger.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 5000;

try {
  await connectDB();
  app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
} catch (err) {
  logger.error("MongoDB connection error", err);
  process.exit(1); // Exit the process with a failure code
}
