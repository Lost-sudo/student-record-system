import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser"

import { logger } from "./config/logger";

import routes from "./routes";

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

export default app;