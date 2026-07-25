import http from "node:http";

import app from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";

const server = http.createServer(app);

server.listen(env.port, env.host, () => {
    logger.info(
        {
            host: env.host,
            port: env.port,
            env: env.nodeEnv
        },
        "Server started",
    );
});

function shutdown(signal: string) {
    logger.info(`${signal} received. Shutting down...`)

    server.close(() => {
        logger.info("Server stopped.");
        process.exit(0);
    });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("uncaughtException", (err) => {
    logger.fatal(err);
    process.exit(1);
});

process.on("unhandledRejection", (reason) => {
    logger.fatal(reason);
    process.exit(1);
});

