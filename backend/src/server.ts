import http from "node:http";

import app from "./app.js";
import { prisma } from "./database/prisma.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const server = http.createServer(app);

async function start() {
    try {
        logger.info("Connecting to PostgreSQL...");

        await prisma.$connect();

        logger.info("Database connected successfully.");

        server.listen(env.port, env.host, () => {
            logger.info(
                {
                    host: env.host,
                    port: env.port,
                    env: env.nodeEnv,
                },
                "Server started",
            );
        });
    } catch (error) {
        logger.fatal(error, "Failed to start server.");
        process.exit(1);
    }
}

async function shutdown(signal: string) {
    logger.info({ signal }, "Shutdown signal received.");

    server.close(async () => {
        try {
            await prisma.$disconnect();
            logger.info("Database disconnected.");
        } catch (error) {
            logger.error(error, "Failed to disconnect database.");
        }

        logger.info("Server stopped.");
        process.exit(0);
    });
}

process.on("SIGINT", () => {
    void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
});

process.on("uncaughtException", async (error) => {
    logger.fatal(error, "Uncaught exception.");

    try {
        await prisma.$disconnect();
    } catch {
        logger.fatal("Failed to disconnect the database.");
    }

    process.exit(1);
});

process.on("unhandledRejection", async (reason) => {
    logger.fatal(reason, "Unhandled promise rejection.");

    try {
        await prisma.$disconnect();
    } catch {
        logger.fatal("Failed to disconnect the database");
    }

    process.exit(1);
});

void start();