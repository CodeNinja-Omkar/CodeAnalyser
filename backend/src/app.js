import express from "express";

// import for loggers
import logger from "../logger.js";
import morgan from "morgan";

//controls who can talk with the application
import cors from "cors";
import healthCheckRouter from "./routes/healthCheck.route.js"
import loginRouter from "./routes/login.route.js"
import logoutRouter from "./routes/logout.route.js"
import signUpRouter from "./routes/signup.route.js"
import cookieParser from "cookie-parser";

const app = express();

const morganFormat = ":method :url :status :response-time ms";
//logger middleware
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);
//cors middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: false,
  })
);
app.use(cookieParser());
app.use(express.json({limit:"16kb"}));
//routes
app.use("/api/v1/healthCheck", healthCheckRouter);
app.use("/api/v1/login", loginRouter);
app.use("/api/v1/logout", logoutRouter);
app.use("/api/v1/signup", signUpRouter);

export { app };
