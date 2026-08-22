import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttpModule from "pino-http";
import cookieParser from "cookie-parser";

import { logger } from "./config/logger.js";

import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const pinoHttp = pinoHttpModule as unknown as typeof pinoHttpModule.default;

const app = express();

app.use(
    pinoHttp({
        logger,
    }),
);

app.use(cors());
app.use(helmet());
app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", routes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Resource not found",
  });
});

app.use(errorHandler);

export default app;
